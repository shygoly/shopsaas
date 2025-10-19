import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '../db/index.js';
import { shops, deployments } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { flyClient } from './fly.js';
import { githubClient } from './github.js';
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
    const { shop_name, slug, app_name, admin_email, admin_password } = shopData;

    console.log(`🚀 Processing shop creation: ${app_name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);
    
    try {
      // Update job progress
      await job.updateProgress(10);

      // Step 1: Provision Fly app and secrets
      console.log(`🔐 Provisioning Fly app: ${app_name}`);
      const flyProvision = await flyClient.provisionShop(
        app_name,
        shop_name,
        admin_email,
        admin_password
      );

      if (!flyProvision.success) {
        throw new Error(`Fly provisioning failed: ${flyProvision.error}`);
      }

      await job.updateProgress(40);
      console.log(`✅ Fly app provisioned: ${app_name}`);

      // Step 2: Trigger GitHub Actions workflow
      const ownerRepo = process.env.GH_REPO;
      const workflow = process.env.GH_WORKFLOW || 'deploy-new-shop.yml';
      
      if (!ownerRepo) {
        throw new Error('GH_REPO environment variable not set');
      }

      const [owner, repo] = ownerRepo.split('/');
      
      console.log(`🚀 Triggering GitHub workflow: ${workflow}`);
      const workflowResult = await githubClient.triggerWorkflow(
        owner,
        repo,
        workflow,
        'main',
        {
          app_name: app_name,
          shop_name: shop_name,
        }
      );

      if (!workflowResult.success) {
        throw new Error(`GitHub workflow trigger failed: ${workflowResult.error}`);
      }

      await job.updateProgress(70);
      console.log(`✅ GitHub workflow triggered successfully`);

      // Step 3: Find workflow run ID and start monitoring
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for run to appear
      
      const recentRunResult = await githubClient.findRecentWorkflowRun(owner, repo, {
        app_name: app_name,
        shop_name: shop_name,
      });

      let githubRunId = null;
      if (recentRunResult.success && recentRunResult.data) {
        githubRunId = recentRunResult.data.id;
        console.log(`🔍 Found GitHub run ID: ${githubRunId}`);
      } else {
        console.warn('Could not find recent workflow run - monitoring will be limited');
      }

      // Update deployment with GitHub run ID
      await db.update(deployments)
        .set({
          status: 'running',
          github_run_id: githubRunId,
          started_at: new Date(),
        })
        .where(eq(deployments.id, deploymentId));

      await job.updateProgress(90);

      // Step 4: Start monitoring in background
      if (githubRunId) {
        console.log(`📋 Starting deployment monitoring for ${app_name}`);
        
        // Don't await this - let it run in background
        deploymentMonitor.startMonitoring(
          deploymentId,
          githubRunId,
          app_name,
          {
            shop_id: shopData.shop_id,
            shop_name,
            user_id: userId,
          }
        ).catch(error => {
          console.error(`Failed to start monitoring for deployment ${deploymentId}:`, error);
        });
      }

      await job.updateProgress(100);
      
      console.log(`🎉 Shop creation job completed: ${app_name}`);
      return {
        success: true,
        app_name,
        github_run_id: githubRunId,
        message: 'Shop creation initiated successfully',
      };

    } catch (error) {
      console.error(`❌ Shop creation failed for ${app_name}:`, error.message);
      
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
        return processor.processShopCreation(job);
      },
      {
        connection: redisConnection,
        concurrency: processor.concurrency,
        stalledInterval: 30 * 1000,
        maxStalledCount: 1,
      }
    );
  } catch (error) {
    console.warn('⚠️ Worker initialization failed:', error.message);
    shopCreationWorker = null;
  }
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

// Graceful shutdown
export async function closeQueue() {
  console.log('🧹 Closing queue and worker...');
  await shopCreationWorker.close();
  await shopCreationQueue.close();
  redisConnection.disconnect();
}