import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '../db/index.js';
import { shops, deployments } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { flyClient } from './fly.js';
import { injectBaselineEnvVars } from './evershop-provision.service.js';
import { deploymentMonitor } from './deployment-monitor.js';

// Redis connection with error handling
let redisConnection = null;
let queueAvailable = false;

if (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'skip') {
  try {
    redisConnection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });
    
    redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully');
      queueAvailable = true;
    });
    
    redisConnection.on('error', (error) => {
      console.warn('⚠️ Redis connection failed, queue system disabled:', error.message);
      queueAvailable = false;
    });
  } catch (error) {
    console.warn('⚠️ Redis setup failed, queue system disabled:', error.message);
  }
} else {
  console.warn('⚠️ Redis not configured, queue system disabled');
}

// Shop creation queue (only if Redis is available)
export let shopCreationQueue = null;

if (redisConnection) {
  try {
    shopCreationQueue = new Queue('shop-creation', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000, // Start with 10 seconds
        },
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100,    // Keep last 100 failed jobs
      },
    });
  } catch (error) {
    console.warn('⚠️ Queue initialization failed:', error.message);
    shopCreationQueue = null;
  }
}

// Job processor class
class ShopCreationProcessor {
  constructor() {
    this.concurrency = parseInt(process.env.SHOP_CREATION_CONCURRENCY) || 2;
    this.maxRetries = 3;
  }

  /**
   * Process shop creation job
   * @param {Object} job - BullMQ job object
   */
  async processShopCreation(job) {
    const { shopData, deploymentId, userId } = job.data;
    const { shop_name, slug, app_name, admin_email, admin_password, plan, limits, expires_at } = shopData;

    console.log(`🚀 Processing shop creation: ${app_name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);
    
    try {
      // Update job progress
      await job.updateProgress(10);

      // Step 1: Inject baseline environment variables so the app can boot
      try {
        const baseline = await injectBaselineEnvVars(app_name, {
          customDomain: null,
          shopId: job.data?.shopData?.shop_id,
          s3: { enable: true },
        });
        console.log(`✅ Baseline env injected for ${app_name}:`, baseline.envKeys.join(','));
      } catch (e) {
        console.warn(`⚠️ Failed to inject baseline env for ${app_name}: ${e.message}`);
      }

      // Step 2: Trigger GitHub Workflow to deploy shop
      console.log(`🚀 Triggering GitHub Workflow for shop deployment: ${app_name}`);
      
      const image = process.env.EVERSHOP_IMAGE || 'registry.fly.io/evershop-fly:deployment-01KB443273PJVSTHG1X6DJ4GE1';
      const callbackUrl = `${process.env.BASE_URL || 'https://shopsaas.fly.dev'}/api/webhooks/deployment`;
      
      const { githubClient } = await import('./github.js');
      
      const workflowPayload = {
        app_name,
        shop_name,
        admin_email,
        admin_password,
        plan,
        limits_json: JSON.stringify(limits),
        expires_at,
        image,
        deployment_id: deploymentId,
        callback_url: callbackUrl,
      };
      
      const dispatchResult = await githubClient.triggerDeploy(workflowPayload);
      
      if (!dispatchResult.success) {
        throw new Error(`GitHub workflow trigger failed: ${dispatchResult.error}`);
      }
      
      console.log(`✅ GitHub workflow dispatched: ${dispatchResult.run_id || 'pending'}`);
      
      await job.updateProgress(40);
      
      // Update deployment with GitHub run info
      await db.update(deployments)
        .set({ 
          status: 'running',
          github_run_id: dispatchResult.run_id,
          started_at: new Date(),
          logs: JSON.stringify({ 
            step: 'workflow_dispatched',
            github_run_id: dispatchResult.run_id,
            image: image,
            timestamp: new Date().toISOString()
          })
        })
        .where(eq(deployments.id, deploymentId));
      
      console.log(`📝 Deployment delegated to GitHub Actions, monitoring...`);
      
      await job.updateProgress(100);
      
      console.log(`🎉 Shop creation job queued to GitHub Actions: ${app_name}`);
      return {
        success: true,
        app_name,
        github_run_id: dispatchResult.run_id,
        message: 'Shop deployment triggered via GitHub Actions',
      };

    } catch (error) {
      console.error(`❌ Shop creation failed for ${app_name}:`, error.message);
      console.error(`❌ Error stack:`, error.stack);
      
      // Log detailed error
      await db.update(deployments)
        .set({ 
          logs: JSON.stringify({ 
            step: 'job_failed',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }),
          status: 'failed',
          error_message: error.message,
          completed_at: new Date()
        })
        .where(eq(deployments.id, deploymentId));
      
      // Update shop and deployment status on failure
      await this.handleJobFailure(shopData.shop_id, deploymentId, error.message);
      
      // Re-throw to let BullMQ handle retries
      throw error;
    }
  }

  /**
   * Handle job failure by updating database
   */
  async handleJobFailure(shopId, deploymentId, errorMessage) {
    try {
      // Update shop status
      await db.update(shops)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(shops.id, shopId));

      // Update deployment status
      await db.update(deployments)
        .set({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date(),
        })
        .where(eq(deployments.id, deploymentId));

      console.log(`📝 Updated failure status for shop ${shopId}`);
    } catch (dbError) {
      console.error('Failed to update failure status:', dbError);
    }
  }

  /**
   * Handle job completion
   */
  async handleJobCompleted(job, result) {
    console.log(`✅ Job completed: ${job.id}`, result);
  }

  /**
   * Handle job failure (after all retries)
   */
  async handleJobFailed(job, error) {
    console.error(`❌ Job failed permanently: ${job.id}`, error.message);
    
    // Send notification to admin about permanent failure
    // This could be email, Slack, etc.
    console.log(`📧 Consider notifying admin about permanent job failure: ${job.id}`);
  }

  /**
   * Handle job stalled
   */
  async handleJobStalled(job) {
    console.warn(`⚠️ Job stalled: ${job.id}`);
  }
}

// Create processor instance
const processor = new ShopCreationProcessor();

// Create worker (only if Redis is available)
export let shopCreationWorker = null;

if (redisConnection && shopCreationQueue) {
  try {
    shopCreationWorker = new Worker(
      'shop-creation',
      async (job) => {
        console.log(`🔄 Worker picked up job: ${job.id}, data:`, JSON.stringify(job.data.shopData, null, 2));
        return processor.processShopCreation(job);
      },
      {
        connection: redisConnection,
        concurrency: processor.concurrency,
        stalledInterval: 30 * 1000,
        maxStalledCount: 1,
      }
    );
    console.log(`✅ Shop creation worker initialized (concurrency: ${processor.concurrency})`);
  } catch (error) {
    console.warn('⚠️ Worker initialization failed:', error.message);
    shopCreationWorker = null;
  }
} else {
  console.warn('⚠️ Worker NOT initialized - Redis or Queue unavailable');
}

// Event handlers (only if worker is available)
if (shopCreationWorker) {
  shopCreationWorker.on('completed', (job, result) => {
    processor.handleJobCompleted(job, result);
  });

  shopCreationWorker.on('failed', (job, error) => {
    processor.handleJobFailed(job, error);
  });

  shopCreationWorker.on('stalled', (job) => {
    processor.handleJobStalled(job);
  });

  shopCreationWorker.on('error', (error) => {
    console.error('Worker error:', error);
  });
}

// Queue management utilities
export class QueueManager {
  /**
   * Add shop creation job to queue
   */
  static async addShopCreationJob(shopData, deploymentId, userId, options = {}) {
    if (!shopCreationQueue) {
      throw new Error('Queue system is not available - Redis connection required');
    }
    
    const jobData = {
      shopData,
      deploymentId,
      userId,
      timestamp: new Date().toISOString(),
    };

    const job = await shopCreationQueue.add(
      'create-shop',
      jobData,
      {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options,
      }
    );

    console.log(`📋 Added shop creation job: ${job.id} for ${shopData.app_name}`);
    return job;
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    if (!shopCreationQueue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
        available: false,
        error: 'Queue system not available - Redis connection required'
      };
    }
    
    try {
      const waiting = await shopCreationQueue.getWaiting();
      const active = await shopCreationQueue.getActive();
      const completed = await shopCreationQueue.getCompleted();
      const failed = await shopCreationQueue.getFailed();
      const delayed = await shopCreationQueue.getDelayed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
        available: true,
      };
    } catch (error) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Get job by ID
   */
  static async getJob(jobId) {
    return shopCreationQueue.getJob(jobId);
  }

  /**
   * Remove job from queue
   */
  static async removeJob(jobId) {
    const job = await shopCreationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }

  /**
   * Clean completed and failed jobs
   */
  static async cleanJobs(grace = 24 * 60 * 60 * 1000) { // 24 hours default
    const cleanedCompleted = await shopCreationQueue.clean(grace, 'completed');
    const cleanedFailed = await shopCreationQueue.clean(grace, 'failed');
    
    console.log(`🧹 Cleaned ${cleanedCompleted.length} completed and ${cleanedFailed.length} failed jobs`);
    return { completed: cleanedCompleted.length, failed: cleanedFailed.length };
  }

  /**
   * Pause queue
   */
  static async pauseQueue() {
    await shopCreationQueue.pause();
    console.log('⏸️ Queue paused');
  }

  /**
   * Resume queue
   */
  static async resumeQueue() {
    await shopCreationQueue.resume();
    console.log('▶️ Queue resumed');
  }
}

// Export Redis connection for health checks
export { redisConnection };

// ============================================
// Scheduled Cleanup Queue & Worker
// ============================================

export let scheduledCleanupQueue = null;
export let cleanupWorker = null;

if (redisConnection) {
  try {
    // Create cleanup queue with repeat job
    scheduledCleanupQueue = new Queue('scheduled-cleanup', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
        removeOnComplete: 10,
        removeOnFail: 50,
      },
    });
    
    // Add repeatable job - runs every hour
    scheduledCleanupQueue.add(
      'cleanup-deleted-shops',
      {},
      {
        repeat: {
          pattern: '0 * * * *', // Every hour at minute 0
        },
        jobId: 'cleanup-deleted-shops-hourly', // Prevent duplicates
      }
    );
    
    console.log('📅 Scheduled cleanup queue initialized (runs hourly)');
  } catch (error) {
    console.warn('⚠️ Cleanup queue initialization failed:', error.message);
  }
}

// Cleanup processor
class CleanupProcessor {
  /**
   * Process scheduled cleanup job
   */
  async processCleanup(job) {
    try {
      console.log('🧹 Running scheduled cleanup check...');
      
      const { cleanupService } = await import('./cleanup.service.js');
      
      // Find shops scheduled for hard deletion
      const now = new Date();
      const shopsList = await db.select().from(shops)
        .where(eq(shops.status, 'deleted'));
      
      const readyForDeletion = shopsList.filter(s => 
        s.scheduled_hard_delete_at && new Date(s.scheduled_hard_delete_at) <= now
      );
      
      if (readyForDeletion.length === 0) {
        console.log('  ℹ️ No shops ready for hard deletion');
        return { processed: 0 };
      }
      
      console.log(`  📋 Found ${readyForDeletion.length} shops ready for hard deletion`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const shop of readyForDeletion) {
        console.log(`  🗑️ Hard deleting shop ${shop.id} (${shop.app_name})`);
        
        const result = await cleanupService.hardDeleteShop(shop.id);
        
        if (result.success) {
          successCount++;
          console.log(`    ✅ Successfully deleted ${shop.app_name}`);
        } else {
          failCount++;
          console.error(`    ❌ Failed to delete ${shop.app_name}: ${result.error}`);
        }
      }
      
      console.log(`🧹 Cleanup completed: ${successCount} success, ${failCount} failed`);
      
      return {
        processed: readyForDeletion.length,
        success: successCount,
        failed: failCount
      };
    } catch (error) {
      console.error('❌ Cleanup process failed:', error);
      throw error;
    }
  }
}

// Initialize cleanup worker
if (scheduledCleanupQueue) {
  const cleanupProcessor = new CleanupProcessor();
  
  cleanupWorker = new Worker(
    'scheduled-cleanup',
    async (job) => {
      return await cleanupProcessor.processCleanup(job);
    },
    {
      connection: redisConnection,
      concurrency: 1, // Run one cleanup at a time
    }
  );
  
  cleanupWorker.on('completed', (job, result) => {
    console.log(`✅ Cleanup job ${job.id} completed:`, result);
  });
  
  cleanupWorker.on('failed', (job, error) => {
    console.error(`❌ Cleanup job ${job.id} failed:`, error.message);
  });
  
  console.log('✅ Cleanup worker initialized');
}

// Graceful shutdown
export async function closeQueue() {
  console.log('🧹 Closing queue and worker...');
  
  if (shopCreationWorker) {
    await shopCreationWorker.close();
  }
  
  if (cleanupWorker) {
    await cleanupWorker.close();
  }
  
  if (shopCreationQueue) {
    await shopCreationQueue.close();
  }
  
  if (scheduledCleanupQueue) {
    await scheduledCleanupQueue.close();
  }
  
  if (redisConnection) {
    redisConnection.disconnect();
  }
}