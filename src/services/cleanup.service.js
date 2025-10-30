import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../db/index.js';
import { shops, deployments, shop_secrets } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

/**
 * Cleanup service for hard deleting shops
 */
export class CleanupService {
  /**
   * Hard delete a shop - removes Fly app and database records
   * @param {number} shopId - Shop ID to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async hardDeleteShop(shopId) {
    try {
      // Fetch shop details
      const shopRecords = await db.select().from(shops)
        .where(eq(shops.id, shopId))
        .limit(1);
      
      if (shopRecords.length === 0) {
        return { success: false, error: 'Shop not found' };
      }
      
      const shop = shopRecords[0];
      
      // Only delete shops marked as deleted
      if (shop.status !== 'deleted') {
        return { success: false, error: 'Shop not marked for deletion' };
      }
      
      console.log(`🧹 Starting hard delete for shop ${shopId} (${shop.app_name})`);
      
      // Step 1: Delete Fly.io app if it exists
      if (shop.app_name) {
        try {
          console.log(`  ↳ Destroying Fly app: ${shop.app_name}`);
          
          // Check if app exists first
          const { stdout: appsList } = await execAsync(`flyctl apps list --json`);
          const apps = JSON.parse(appsList);
          const appExists = apps.some(app => app.Name === shop.app_name);
          
          if (appExists) {
            await execAsync(`flyctl apps destroy ${shop.app_name} --yes`);
            console.log(`  ✅ Fly app ${shop.app_name} destroyed`);
          } else {
            console.log(`  ℹ️ Fly app ${shop.app_name} not found (may already be deleted)`);
          }
        } catch (flyError) {
          console.error(`  ⚠️ Failed to destroy Fly app ${shop.app_name}:`, flyError.message);
          // Continue with database cleanup even if Fly deletion fails
        }
      }
      
      // Step 2: Delete database records (cascade will handle deployments, shop_secrets, etc.)
      console.log(`  ↳ Deleting database records for shop ${shopId}`);
      await db.delete(shops).where(eq(shops.id, shopId));
      console.log(`  ✅ Database records deleted`);
      
      console.log(`🎉 Hard delete completed for shop ${shopId} (${shop.app_name})`);
      
      return {
        success: true,
        app_name: shop.app_name,
        deleted_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Hard delete failed for shop ${shopId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get list of shops scheduled for hard deletion
   * @returns {Promise<Array>}
   */
  async getScheduledForDeletion() {
    try {
      const now = new Date();
      const scheduled = await db.select().from(shops)
        .where(eq(shops.status, 'deleted'))
        .orderBy(shops.scheduled_hard_delete_at);
      
      return scheduled.map(s => ({
        id: s.id,
        shop_name: s.shop_name,
        app_name: s.app_name,
        deleted_at: s.deleted_at,
        scheduled_hard_delete_at: s.scheduled_hard_delete_at,
        ready_for_deletion: s.scheduled_hard_delete_at && new Date(s.scheduled_hard_delete_at) <= now
      }));
    } catch (error) {
      console.error('Failed to get scheduled deletions:', error);
      return [];
    }
  }
}

export const cleanupService = new CleanupService();

