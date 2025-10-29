import { db } from '../db/index.js';
import { shops, deployments } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { flyClient } from './fly.js';
import { sendShopCreatedNotification } from '../auth/email.js';

class DeploymentMonitor {
  constructor() {
    this.activeMonitors = new Map();
    this.pollInterval = 30 * 1000; // 30 seconds
    this.maxMonitorTime = 45 * 60 * 1000; // 45 minutes
  }

  /**
   * Start monitoring a deployment
   * @param {number} deploymentId - Deployment ID
   * @param {string} machineId - Fly machine ID
   * @param {string} appName - Fly app name
   * @param {Object} shopData - Shop information
   */
  async startMonitoring(deploymentId, machineId, appName, shopData) {
    if (this.activeMonitors.has(deploymentId)) {
      console.log(`Already monitoring deployment ${deploymentId}`);
      return;
    }

    console.log(`🔍 Starting monitoring for deployment ${deploymentId} (machine: ${machineId})`);
    
    // Store monitor info
    this.activeMonitors.set(deploymentId, {
      machineId,
      appName,
      shopData,
      startTime: Date.now(),
    });

    try {
      // Start machine monitoring
      await this.monitorMachine(deploymentId, machineId, appName);
      
      const finalResult = await this.verifyAppHealth(appName);
      await this.handleMonitoringComplete(deploymentId, finalResult);
    } catch (error) {
      console.error(`Error monitoring deployment ${deploymentId}:`, error);
      await this.handleMonitoringError(deploymentId, error);
    } finally {
      this.activeMonitors.delete(deploymentId);
    }
  }

  /**
   * Monitor Fly machine state and health
   * @param {number} deploymentId - Deployment ID
   * @param {string} machineId - Machine ID
   * @param {string} appName - App name
   */
  async monitorMachine(deploymentId, machineId, appName) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.maxMonitorTime) {
      try {
        const machineResult = await flyClient.getMachine(appName, machineId);
        
        if (machineResult.success) {
          const machine = machineResult.data;
          console.log(`📊 Machine ${machineId} state: ${machine.state}`);
          
          // Update deployment with machine state
          await db.update(deployments)
            .set({
              logs: JSON.stringify({
                machine_id: machineId,
                state: machine.state,
                last_updated: new Date().toISOString(),
              }),
            })
            .where(eq(deployments.id, deploymentId));
          
          // If machine is started, check health
          if (machine.state === 'started') {
            console.log(`✅ Machine ${machineId} is started, verifying health...`);
            break;
          }
          
          // If machine failed, exit
          if (machine.state === 'stopped' || machine.state === 'destroyed') {
            throw new Error(`Machine ${machineId} stopped unexpectedly: ${machine.state}`);
          }
        }
      } catch (error) {
        console.error(`Error checking machine state:`, error);
      }
      
      await this.sleep(this.pollInterval);
    }
  }
  
  /**
   * Sleep utility
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle monitoring completion
   * @param {number} deploymentId - Deployment ID
   * @param {Object} result - Health check result
   */
  async handleMonitoringComplete(deploymentId, result) {
    const monitorInfo = this.activeMonitors.get(deploymentId);
    if (!monitorInfo) return;

    const { appName, shopData } = monitorInfo;
    
    try {
      let finalShopStatus = 'failed';
      let finalDeploymentStatus = 'failed';
      let errorMessage = null;

      if (result.healthy) {
        finalShopStatus = 'active';
        finalDeploymentStatus = 'success';
        console.log(`🎉 Shop deployment completed successfully: ${appName}`);
        
        // Collect and store runtime metrics
        try {
          const metricsResult = await flyClient.getMachineMetrics(appName, monitorInfo.machineId);
          if (metricsResult.success) {
            await db.update(shops)
              .set({
                runtime_metrics: JSON.stringify(metricsResult.data),
                updated_at: new Date()
              })
              .where(eq(shops.id, shopData.shop_id));
          }
        } catch (metricsError) {
          console.warn('Failed to collect metrics:', metricsError);
        }
        
        // Send success notification
        await this.sendSuccessNotification(shopData, appName);
      } else {
        errorMessage = `App deployed but health check failed: ${result.error}`;
        console.error(errorMessage);
      }

      // Update database records
      await this.updateFinalStatus(deploymentId, shopData.shop_id, {
        deploymentStatus: finalDeploymentStatus,
        shopStatus: finalShopStatus,
        errorMessage,
        completedAt: new Date(),
      });

    } catch (error) {
      console.error(`Error handling monitoring completion for deployment ${deploymentId}:`, error);
      await this.updateFinalStatus(deploymentId, shopData.shop_id, {
        deploymentStatus: 'failed',
        shopStatus: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      });
    }
  }

  /**
   * Verify app health with multiple checks
   * @param {string} appName - Fly app name
   * @returns {Promise<Object>} Health check result
   */
  async verifyAppHealth(appName, maxRetries = 5) {
    const retryDelay = 10 * 1000; // 10 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔍 Health check attempt ${attempt}/${maxRetries} for ${appName}`);
      
      try {
        // Check Fly app status
        const flyStatus = await flyClient.getAppStatus(appName);
        if (!flyStatus.success) {
          console.log(`Fly status check failed: ${flyStatus.error}`);
          if (attempt < maxRetries) {
            await this.sleep(retryDelay);
            continue;
          }
          return { healthy: false, error: flyStatus.error };
        }

        // HTTP health check
        const httpHealth = await flyClient.healthCheck(appName);
        if (httpHealth.healthy) {
          console.log(`✅ App ${appName} is healthy`);
          return { healthy: true, url: httpHealth.url };
        }

        console.log(`HTTP health check failed: ${httpHealth.error}`);
        if (attempt < maxRetries) {
          await this.sleep(retryDelay);
          continue;
        }
        
        return { healthy: false, error: httpHealth.error };
        
      } catch (error) {
        console.error(`Health check error for ${appName}:`, error);
        if (attempt < maxRetries) {
          await this.sleep(retryDelay);
          continue;
        }
        return { healthy: false, error: error.message };
      }
    }
  }

  /**
   * Update final status in database
   * @param {number} deploymentId - Deployment ID
   * @param {number} shopId - Shop ID
   * @param {Object} statusData - Status data to update
   */
  async updateFinalStatus(deploymentId, shopId, statusData) {
    try {
      // Update deployment record
      await db.update(deployments)
        .set({
          status: statusData.deploymentStatus,
          error_message: statusData.errorMessage,
          completed_at: statusData.completedAt,
        })
        .where(eq(deployments.id, deploymentId));

      // Update shop status
      await db.update(shops)
        .set({
          status: statusData.shopStatus,
          updated_at: statusData.completedAt,
        })
        .where(eq(shops.id, shopId));

      console.log(`📝 Updated final status - Shop: ${statusData.shopStatus}, Deployment: ${statusData.deploymentStatus}`);
    } catch (error) {
      console.error('Failed to update final status:', error);
    }
  }

  /**
   * Send success notification email
   * @param {Object} shopData - Shop data
   * @param {string} appName - App name
   */
  async sendSuccessNotification(shopData, appName) {
    try {
      const shopUrl = `https://${appName}.fly.dev`;
      
      // Get user email from database
      const shopRecord = await db
        .select({
          user_email: 'users.email',
          shop_name: shops.shop_name,
          admin_email: shops.admin_email,
        })
        .from(shops)
        .leftJoin('users', eq(shops.user_id, 'users.id'))
        .where(eq(shops.id, shopData.shop_id))
        .limit(1);

      if (shopRecord.length > 0) {
        const shop = shopRecord[0];
        await sendShopCreatedNotification(
          shop.user_email,
          shop.shop_name,
          shopUrl,
          {
            email: shop.admin_email,
            password: '[Set via Fly secrets]',
          }
        );
        console.log(`📧 Sent success notification for shop: ${shop.shop_name}`);
      }
    } catch (error) {
      console.error('Failed to send success notification:', error);
    }
  }

  /**
   * Handle monitoring errors
   * @param {number} deploymentId - Deployment ID
   * @param {Error} error - Error object
   */
  async handleMonitoringError(deploymentId, error) {
    try {
      const monitorInfo = this.activeMonitors.get(deploymentId);
      const shopId = monitorInfo?.shopData?.shop_id;

      await this.updateFinalStatus(deploymentId, shopId, {
        deploymentStatus: 'failed',
        shopStatus: 'failed',
        errorMessage: `Monitoring error: ${error.message}`,
        completedAt: new Date(),
      });
    } catch (updateError) {
      console.error('Failed to handle monitoring error:', updateError);
    }
  }

  /**
   * Get active monitors count
   */
  getActiveMonitorsCount() {
    return this.activeMonitors.size;
  }

  /**
   * Get monitor info for debugging
   */
  getMonitorInfo(deploymentId) {
    return this.activeMonitors.get(deploymentId);
  }

  /**
   * Sleep utility
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup stale monitors (for graceful shutdown)
   */
  cleanup() {
    console.log(`🧹 Cleaning up ${this.activeMonitors.size} active monitors`);
    this.activeMonitors.clear();
  }
}

// Export singleton instance
export const deploymentMonitor = new DeploymentMonitor();
export default deploymentMonitor;