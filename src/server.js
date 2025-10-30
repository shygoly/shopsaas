import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import slugify from 'slugify';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './db/index.js';
import passport from './auth/config.js';
import { sendMagicLink, verifyEmailToken } from './auth/email.js';
import { db } from './db/index.js';
import { users, shops, deployments, audit_logs, subscriptions, shop_secrets, credit_transactions } from './db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { flyClient } from './services/fly.js';
import { githubClient } from './services/github.js';
import { deploymentMonitor } from './services/deployment-monitor.js';
import { QueueManager, closeQueue } from './services/queue.js';
import * as creditService from './services/credit.service.js';
import * as chatbotIntegration from './services/chatbot-integration.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust Fly.io proxy headers for correct protocol/host in OAuth and rate limiting (one hop via Fly proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for OAuth redirects
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);
app.use('/auth/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Static files
app.use(express.static('public'));

// Dashboard page (client-side will check auth and redirect if needed)
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Session configuration
const PgSession = pgSession(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Test database connection
await testConnection();

// Ensure DB bootstrap (create missing tables/columns)
import { ensureDatabaseBootstrap } from './db/bootstrap.js';
ensureDatabaseBootstrap().catch((e) => console.error('DB bootstrap error:', e));

// Utility functions
function logAuditEvent(userId, action, resourceType, resourceId, details, req) {
  // Don't await this - fire and forget
  db.insert(audit_logs).values({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
  }).catch(console.error);
}

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// System status endpoint
app.get('/api/system/status', requireAuth, async (req, res) => {
  try {
    // Check if user has admin privileges (for now, all authenticated users can access)
    const activeMonitors = deploymentMonitor.getActiveMonitorsCount();
    const queueStats = await QueueManager.getQueueStats();
    
    // Get recent deployment statistics
    const recentDeployments = await db
      .select({
        status: deployments.status,
        created_at: deployments.created_at,
      })
      .from(deployments)
      .where(
        // Last 24 hours
        eq(deployments.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000))
      )
      .orderBy(desc(deployments.created_at))
      .limit(100);

    const stats = {
      active_monitors: activeMonitors,
      queue: queueStats,
      recent_deployments: {
        total: recentDeployments.length,
        success: recentDeployments.filter(d => d.status === 'success').length,
        failed: recentDeployments.filter(d => d.status === 'failed').length,
        running: recentDeployments.filter(d => d.status === 'running').length,
        queued: recentDeployments.filter(d => d.status === 'queued').length,
      },
      system_health: {
        database: true, // If we get here, DB is working
        github_token: !!process.env.GITHUB_TOKEN,
        fly_token: !!process.env.FLY_API_TOKEN,
        redis: true, // If queue stats work, Redis is working
      },
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to get system status:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

// Queue management endpoints
app.get('/api/admin/queue/stats', requireAuth, async (req, res) => {
  try {
    const stats = await QueueManager.getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

app.post('/api/admin/queue/clean', requireAuth, async (req, res) => {
  try {
    const { grace = 24 * 60 * 60 * 1000 } = req.body; // 24 hours default
    const result = await QueueManager.cleanJobs(grace);
    
    logAuditEvent(
      req.user.id,
      'queue_cleaned',
      'system',
      null,
      { completed: result.completed, failed: result.failed, grace },
      req
    );
    
    res.json({
      success: true,
      cleaned: result,
      message: `Cleaned ${result.completed} completed and ${result.failed} failed jobs`
    });
  } catch (error) {
    console.error('Failed to clean queue:', error);
    res.status(500).json({ error: 'Failed to clean queue' });
  }
});

app.post('/api/admin/queue/pause', requireAuth, async (req, res) => {
  try {
    await QueueManager.pauseQueue();
    
    logAuditEvent(
      req.user.id,
      'queue_paused',
      'system',
      null,
      {},
      req
    );
    
    res.json({ success: true, message: 'Queue paused' });
  } catch (error) {
    console.error('Failed to pause queue:', error);
    res.status(500).json({ error: 'Failed to pause queue' });
  }
});

app.post('/api/admin/queue/resume', requireAuth, async (req, res) => {
  try {
    await QueueManager.resumeQueue();
    
    logAuditEvent(
      req.user.id,
      'queue_resumed',
      'system',
      null,
      {},
      req
    );
    
    res.json({ success: true, message: 'Queue resumed' });
  } catch (error) {
    console.error('Failed to resume queue:', error);
    res.status(500).json({ error: 'Failed to resume queue' });
  }
});

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err, info);
      return res.status(500).send('OAuth error');
    }
    if (!user) {
      console.error('Google OAuth failed, no user returned', info);
      return res.redirect('/?oauth=google_failed');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login session error:', loginErr);
        return res.status(500).send('Login failed');
      }
      logAuditEvent(user.id, 'login', 'user', String(user.id), { method: 'google' }, req);
      const base = process.env.FRONTEND_URL || '';
      return res.redirect(`${base}/dashboard`);
    });
  })(req, res, next);
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    logAuditEvent(req.user.id, 'login', 'user', req.user.id.toString(), { method: 'github' }, req);
    const base = process.env.FRONTEND_URL || '';
    res.redirect(`${base}/dashboard`);
  }
);

// Email authentication
app.post('/auth/email/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    await sendMagicLink(email, 'login');
    res.json({ success: true, message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
});

app.get('/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await verifyEmailToken(token);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Log the user in
    req.login(result.user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      logAuditEvent(result.user.id, 'login', 'user', result.user.id.toString(), { method: 'email' }, req);
      res.redirect(process.env.FRONTEND_URL || '/');
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/auth/logout', (req, res) => {
  if (req.user) {
    logAuditEvent(req.user.id, 'logout', 'user', req.user.id.toString(), {}, req);
  }
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/user', async (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  // include credits info
  try {
    const me = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const u = me[0];
    if (!u) return res.json({ user: null });
    const { password_hash, ...userWithoutPassword } = u;
    return res.json({ user: userWithoutPassword });
  } catch {
    const { password_hash, ...userWithoutPassword } = req.user;
    return res.json({ user: userWithoutPassword });
  }
});

// Billing summary
app.get('/api/billing/summary', requireAuth, async (req, res) => {
  try {
    const me = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const u = me[0];
    const priceCNYPer1000 = 100;
    res.json({
      credits: u?.credits || 0,
      first_shop_redeemed: !!u?.first_shop_redeemed,
      pricing: { create_empty_shop_credits: 1000, price_cny: priceCNYPer1000 },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load billing' });
  }
});

// Grant credits (for testing/admin) - TODO: restrict to admins later
app.post('/api/billing/grant', requireAuth, async (req, res) => {
  try {
    const amount = parseInt(req.body?.amount || '0', 10);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid_amount' });
    await db.update(users)
      .set({ credits: (req.user.credits || 0) + amount, updated_at: new Date() })
      .where(eq(users.id, req.user.id));
    logAuditEvent(req.user.id, 'credits_granted', 'user', String(req.user.id), { amount }, req);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'grant_failed' });
  }
});

// Webhook endpoint for GitHub Actions callbacks
app.post('/api/webhooks/deployment', async (req, res) => {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.SHOPSAAS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = req.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      
      const token = authHeader.split(' ')[1];
      if (token !== webhookSecret) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }
    }

    const { app_name, shop_name, status, message, app_url, github_run_id } = req.body;
    
    console.log(`📡 Received webhook for ${app_name}: ${status}`);
    
    if (!app_name || !status) {
      return res.status(400).json({ error: 'app_name and status are required' });
    }

    // Find the shop and deployment
    const shop = await db
      .select()
      .from(shops)
      .where(eq(shops.app_name, app_name))
      .limit(1);

    if (shop.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Update shop status based on webhook
    const shopStatus = status === 'active' ? 'active' : 'failed';
    await db.update(shops)
      .set({ 
        status: shopStatus,
        updated_at: new Date()
      })
      .where(eq(shops.id, shop[0].id));

    // Update deployment if we can find it
    if (github_run_id) {
      const deploymentStatus = status === 'active' ? 'success' : 'failed';
      await db.update(deployments)
        .set({
          status: deploymentStatus,
          completed_at: new Date(),
          error_message: status === 'failed' ? message : null,
        })
        .where(and(
          eq(deployments.shop_id, shop[0].id),
          eq(deployments.github_run_id, github_run_id)
        ));
    }

    // Log audit event
    logAuditEvent(
      shop[0].user_id,
      'deployment_webhook',
      'shop',
      shop[0].id.toString(),
      { app_name, status, message, github_run_id },
      req
    );

    console.log(`✅ Updated ${app_name} status to ${shopStatus}`);
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed', detail: error.message });
  }
});

function makeSlug(name) {
  return slugify(name, { lower: true, strict: true }).slice(0, 40);
}

// Create new shop
app.post('/api/shops', requireAuth, async (req, res) => {
  try {
    const { shop_name, admin_email, admin_password } = req.body || {};
    if (!shop_name || !admin_email || !admin_password) {
      return res.status(400).json({ error: 'shop_name, admin_email, admin_password are required' });
    }

    // Check required Fly.io configuration
    const flyToken = process.env.FLY_API_TOKEN;
    if (!flyToken) {
      return res.status(501).json({ error: 'Server not configured: FLY_API_TOKEN missing' });
    }

    const slug = makeSlug(shop_name);
    const appName = `evershop-fly-${slug}`;

    // Billing constants
    const SHOP_COST_CREDITS = parseInt(process.env.SHOP_COST_CREDITS || '1000', 10);
    const DEFAULT_LIMITS = { max_products: 100, max_orders_per_month: 1000 };

    // Load user billing state
    const me = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const currentUser = me[0];
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    // Check first shop free
    let isFree = false;
    let willDeduct = 0;
    if (!currentUser.first_shop_redeemed) {
      isFree = true;
    } else {
      // Need credits
      if ((currentUser.credits || 0) < SHOP_COST_CREDITS) {
        return res.status(402).json({ error: 'insufficient_credits', need: SHOP_COST_CREDITS, have: currentUser.credits || 0 });
      }
      willDeduct = SHOP_COST_CREDITS;
    }

    // Check if shop name/slug is already taken
    const existingShop = await db.select().from(shops).where(
      eq(shops.slug, slug)
    ).limit(1);
    
    if (existingShop.length > 0) {
      return res.status(409).json({ error: 'Shop name already taken', slug });
    }

    // Determine plan/limits/expiry
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    const plan = isFree ? 'free-first-year' : 'standard';

    // Create shop record in database
    const newShop = await db.insert(shops).values({
      user_id: req.user.id,
      shop_name,
      slug,
      app_name: appName,
      admin_email,
      status: 'creating',
      plan,
      config: JSON.stringify({ limits: DEFAULT_LIMITS }),
      expires_at: expiresAt,
    }).returning();

    const shop = newShop[0];

    // Create deployment record
    const newDeployment = await db.insert(deployments).values({
      shop_id: shop.id,
      status: 'queued',
    }).returning();

    // Deduct credits or mark first shop redeemed before invoking provisioning
    let deducted = false;
    try {
      if (willDeduct > 0) {
        await db.update(users)
          .set({ credits: (currentUser.credits || 0) - willDeduct, updated_at: new Date() })
          .where(eq(users.id, currentUser.id));
        deducted = true;
        logAuditEvent(currentUser.id, 'credits_deducted', 'user', String(currentUser.id), { amount: willDeduct, reason: 'create_shop', shop_id: shop?.id }, req);
      } else if (isFree && !currentUser.first_shop_redeemed) {
        await db.update(users)
          .set({ first_shop_redeemed: true, updated_at: new Date() })
          .where(eq(users.id, currentUser.id));
        logAuditEvent(currentUser.id, 'first_shop_redeemed', 'user', String(currentUser.id), { shop_id: shop?.id }, req);
      }

      const shopData = {
        shop_id: shop.id,
        shop_name,
        slug,
        app_name: appName,
        admin_email,
        admin_password,
        plan,
        limits: DEFAULT_LIMITS,
        expires_at: expiresAt.toISOString(),
      };

      // Try to use queue system first, fallback to direct processing
      let queuedJobId = null;
      try {
        console.log(`📋 Adding shop creation to queue: ${appName}`);
        const job = await QueueManager.addShopCreationJob(
          shopData,
          newDeployment[0].id,
          req.user.id
        );

        console.log(`✅ Shop creation job queued: ${job.id}`);
        queuedJobId = job.id;
        
        // Update deployment with job ID for tracking
        await db.update(deployments)
          .set({ 
            logs: JSON.stringify({ 
              job_id: job.id,
              queued_at: new Date().toISOString(),
              processing_mode: 'queued'
            })
          })
          .where(eq(deployments.id, newDeployment[0].id));
          
      } catch (queueError) {
        console.warn(`⚠️ Queue unavailable, will process when queue is restored: ${queueError.message}`);
        
        // Update deployment to show queue unavailable
        await db.update(deployments)
          .set({ 
            logs: JSON.stringify({ 
              processing_mode: 'queue_unavailable',
              error: 'Queue system unavailable - Redis connection required',
              queued_at: new Date().toISOString()
            })
          })
          .where(eq(deployments.id, newDeployment[0].id));
      }

      // Log audit event
      logAuditEvent(
        req.user.id, 
        'shop_created', 
        'shop', 
        shop.id.toString(),
        { shop_name, app_name: appName, slug, job_id: queuedJobId },
        req
      );

      // Determine response based on processing mode
      const rawLogs = await db.select({ logs: deployments.logs })
        .from(deployments)
        .where(eq(deployments.id, newDeployment[0].id))
        .then(results => results[0]?.logs || {});
      const logs = typeof rawLogs === 'string' ? JSON.parse(rawLogs || '{}') : (rawLogs || {});
      
      if (logs.processing_mode === 'queued') {
        return res.status(202).json({
          id: shop.id,
          app_name: appName,
          shop_name,
          slug,
          status: 'queued',
          deployment_id: newDeployment[0].id,
          job_id: logs.job_id,
          message: 'Shop creation has been queued and will be processed shortly'
        });
      } else {
        return res.status(202).json({
          id: shop.id,
          app_name: appName,
          shop_name,
          slug,
          status: 'pending',
          deployment_id: newDeployment[0].id,
          message: 'Shop creation request received. Queue system currently unavailable - processing will begin when system is restored.'
        });
      }
    } catch (deployError) {
      // Refund credits if deducted
      try {
        if (deducted && willDeduct > 0) {
          await db.update(users)
            .set({ credits: (currentUser.credits || 0), updated_at: new Date() })
            .where(eq(users.id, currentUser.id));
          logAuditEvent(currentUser.id, 'credits_refund', 'user', String(currentUser.id), { amount: willDeduct, reason: 'provision_failed', shop_id: shop?.id }, req);
        }
      } catch {}

      // Update shop and deployment status on deployment failure
      await db.update(shops)
        .set({ status: 'failed' })
        .where(eq(shops.id, shop.id));
      
      await db.update(deployments)
        .set({ 
          status: 'failed',
          error_message: deployError?.response?.data?.message || deployError.message,
          completed_at: new Date()
        })
        .where(eq(deployments.id, newDeployment[0].id));
      
      throw deployError;
    }
  } catch (e) {
    console.error('provision error:', e?.response?.data || e.message || e);
    return res.status(500).json({ error: 'provision_failed', detail: e?.response?.data || e.message });
  }
});

// Get user's shops
app.get('/api/shops', requireAuth, async (req, res) => {
  try {
    const userShops = await db
      .select({
        id: shops.id,
        shop_name: shops.shop_name,
        slug: shops.slug,
        app_name: shops.app_name,
        domain: shops.domain,
        status: shops.status,
        chatbot_enabled: shops.chatbot_enabled,
        chatbot_bot_id: shops.chatbot_bot_id,
        chatbot_enabled_at: shops.chatbot_enabled_at,
        created_at: shops.created_at,
        updated_at: shops.updated_at,
      })
      .from(shops)
      .where(eq(shops.user_id, req.user.id))
      .orderBy(desc(shops.created_at));

    res.json({ 
      shops: userShops,
      credits: req.user.credits || 0, // Include user credits for UI
    });
  } catch (error) {
    console.error('Failed to fetch shops:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get shop status by ID
app.get('/api/shops/:id/status', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    if (isNaN(shopId)) {
      return res.status(400).json({ error: 'Invalid shop ID' });
    }

    // Get shop with latest deployment
    const shop = await db
      .select({
        id: shops.id,
        shop_name: shops.shop_name,
        slug: shops.slug,
        app_name: shops.app_name,
        domain: shops.domain,
        status: shops.status,
        created_at: shops.created_at,
        updated_at: shops.updated_at,
      })
      .from(shops)
      .where(and(
        eq(shops.id, shopId),
        eq(shops.user_id, req.user.id)
      ))
      .limit(1);

    if (shop.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get latest deployment
    const latestDeployment = await db
      .select()
      .from(deployments)
      .where(eq(deployments.shop_id, shopId))
      .orderBy(desc(deployments.created_at))
      .limit(1);

    const shopUrl = shop[0].domain || `https://${shop[0].app_name}.fly.dev`;
    
    res.json({
      shop: shop[0],
      deployment: latestDeployment[0] || null,
      shop_url: shopUrl,
    });
  } catch (error) {
    console.error('Failed to fetch shop status:', error);
    res.status(500).json({ error: 'Failed to fetch shop status' });
  }
});

// Update shop (name/domain)
app.patch('/api/shops/:id', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    const { shop_name, domain } = req.body;

    const owned = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.user_id, req.user.id)))
      .limit(1);
    if (owned.length === 0) return res.status(404).json({ error: 'Shop not found' });

    await db.update(shops)
      .set({
        ...(shop_name ? { shop_name } : {}),
        ...(domain ? { domain } : {}),
        updated_at: new Date(),
      })
      .where(eq(shops.id, shopId));

    res.json({ success: true });
  } catch (e) {
    console.error('Update shop error:', e);
    res.status(500).json({ error: 'Failed to update shop' });
  }
});

// Delete shop (soft delete)
app.delete('/api/shops/:id', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    const owned = await db.select().from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.user_id, req.user.id)))
      .limit(1);
    if (owned.length === 0) return res.status(404).json({ error: 'Shop not found' });

    const now = new Date();
    const hardDeleteDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    await db.update(shops)
      .set({ 
        status: 'deleted', 
        deleted_at: now,
        scheduled_hard_delete_at: hardDeleteDate,
        updated_at: now 
      })
      .where(eq(shops.id, shopId));

    // Log audit event
    await logAuditEvent(
      req.user.id,
      'shop_soft_deleted',
      'shop',
      shopId,
      {
        shop_name: owned[0].shop_name,
        app_name: owned[0].app_name,
        hard_delete_scheduled: hardDeleteDate.toISOString()
      },
      req
    );

    console.log(`🗑️ Shop ${shopId} soft deleted, scheduled hard delete on ${hardDeleteDate.toISOString()}`);

    res.json({ success: true, scheduled_hard_delete_at: hardDeleteDate });
  } catch (e) {
    console.error('Delete shop error:', e);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
});

// Test email endpoint (for configuration testing)
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailService = await import('./auth/email.js');
    const testToken = 'test-' + Date.now();
    const result = await emailService.sendMagicLink(email, testToken);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      recipient: email,
      provider: process.env.EMAIL_PROVIDER || 'not configured'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      provider: process.env.EMAIL_PROVIDER || 'not configured'
    });
  }
});

// 密码登录
app.post('/auth/password/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.loginWithPassword(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // 记录审计日志
    await logAuditEvent(result.user.id, 'password_login', 'user', result.user.id, {
      email: result.user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    }, req);

    // 设置会话
    req.login(result.user, (err) => {
      if (err) {
        console.error('Login session error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ success: true, user: result.user });
    });
  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 注册用户
app.post('/auth/password/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 密码强度检验
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.registerWithPassword(email, password, name);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // 记录审计日志
    await logAuditEvent(result.user.id, 'user_register', 'user', result.user.id, {
      email: result.user.email,
      method: 'password',
      ip: req.ip,
      user_agent: req.get('User-Agent')
    }, req);

    res.json({ 
      success: true, 
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        email_verified: result.user.email_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 邮箱验证
app.get('/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.verifyEmail(token);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // 记录审计日志
    await logAuditEvent(result.user.id, 'email_verified', 'user', result.user.id, {
      email: result.user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    }, req);

    // 自动登录已验证的用户
    req.login(result.user, (err) => {
      if (err) {
        console.error('Auto login error:', err);
        return res.json({ 
          success: true, 
          message: result.message,
          user: result.user
        });
      }
      
      // 重定向到仪表板
      res.redirect('/?verified=true');
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 发送密码重置邮件
app.post('/auth/password/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.sendPasswordReset(email);
    
    // 总是返回成功（安全考虑）
    res.json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// 重置密码
app.post('/auth/password/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.resetPassword(token, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // 记录审计日志
    await logAuditEvent(result.user.id, 'password_reset', 'user', result.user.id, {
      email: result.user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    }, req);

    res.json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// 更改密码（已登录用户）
app.post('/auth/password/change', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.changePassword(req.user.id, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // 记录审计日志
    await logAuditEvent(req.user.id, 'password_change', 'user', req.user.id, {
      email: req.user.email,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    }, req);

    res.json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// 重新发送验证邮件
app.post('/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const passwordAuth = await import('./auth/password.js');
    const result = await passwordAuth.sendEmailVerification(email);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      success: true, 
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

const port = process.env.PORT || 3000;
// ===== Queue Debugging Routes =====

// Get deployment and job details for debugging
app.get('/api/admin/deployments/:id', requireAuth, async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.id, 10);
    
    const deployment = await db.select()
      .from(deployments)
      .where(eq(deployments.id, deploymentId))
      .limit(1);
    
    if (deployment.length === 0) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    // Get associated shop
    const shop = await db.select()
      .from(shops)
      .where(eq(shops.id, deployment[0].shop_id))
      .limit(1);
    
    // Try to get BullMQ job if available
    let jobStatus = null;
    try {
      const logs = typeof deployment[0].logs === 'string' ? JSON.parse(deployment[0].logs) : deployment[0].logs;
      if (logs?.job_id) {
        const job = await QueueManager.getJob(logs.job_id);
        if (job) {
          jobStatus = {
            id: job.id,
            state: await job.getState(),
            progress: job.progress,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch job status:', e.message);
    }
    
    res.json({
      deployment: deployment[0],
      shop: shop[0] || null,
      job: jobStatus,
    });
  } catch (error) {
    console.error('Failed to fetch deployment details:', error);
    res.status(500).json({ error: 'Failed to fetch deployment' });
  }
});

// ===== Chatbot Integration Routes =====

// Enable chatbot for a shop
app.post('/api/shops/:id/chatbot/enable', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id, 10);
    const { botName } = req.body || {};
    
    // Get shop and verify ownership
    const shopResult = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    const shop = shopResult[0];
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    if (shop.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (shop.chatbot_enabled) {
      return res.status(409).json({ error: 'Chatbot already enabled for this shop' });
    }
    
    // Check credits
    const costCredits = parseInt(process.env.CREDIT_CHATBOT_ENABLEMENT || '50', 10);
    const currentBalance = req.user.credits || 0;
    
    if (currentBalance < costCredits) {
      return res.status(402).json({ 
        error: 'insufficient_credits', 
        need: costCredits, 
        have: currentBalance 
      });
    }
    
    try {
      // Deduct credits first (with transaction)
      const newBalance = await creditService.deductCredits(
        req.user.id, 
        costCredits, 
        'chatbot_enablement', 
        shopId
      );
      
      // Register with chatbot-node
      const chatbotData = await chatbotIntegration.registerChatbot(shop, req.user.id, botName);
      
      // Get the secrets that were just created
      const secretsResult = await db.select()
        .from(shop_secrets)
        .where(eq(shop_secrets.shop_id, shopId))
        .limit(1);
      
      const secrets = secretsResult[0];
      
      // Inject chatbot environment variables to EverShop Fly app
      const envVarsInjected = await chatbotIntegration.injectChatbotEnvVars(
        shop, 
        secrets.sso_secret, 
        secrets.webhook_secret
      );
      
      if (!envVarsInjected) {
        console.warn(`⚠️ Chatbot enabled but failed to inject env vars to ${shop.app_name}`);
      }
      
      // Update shop
      await db.update(shops)
        .set({ 
          chatbot_enabled: true,
          chatbot_bot_id: chatbotData?.config?.botId || null,
          chatbot_enabled_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(shops.id, shopId));
      
      // Create subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      await db.insert(subscriptions).values({
        user_id: req.user.id,
        shop_id: shopId,
        feature: 'chatbot',
        status: 'active',
        expires_at: expiresAt,
      });
      
      // Log audit event
      logAuditEvent(
        req.user.id,
        'chatbot_enabled',
        'shop',
        shopId.toString(),
        { bot_id: chatbotData?.config?.botId, credits_deducted: costCredits, env_vars_injected: envVarsInjected },
        req
      );
      
      res.json({ 
        success: true,
        botId: chatbotData?.config?.botId,
        creditsRemaining: newBalance,
        expiresAt: expiresAt.toISOString(),
        envVarsInjected,
      });
      
    } catch (error) {
      console.error('Chatbot enablement failed:', error);
      res.status(500).json({ 
        error: 'Chatbot enablement failed', 
        message: error.message 
      });
    }
  } catch (error) {
    console.error('Chatbot enable error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

// Get chatbot status for a shop
app.get('/api/shops/:id/chatbot/status', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id, 10);
    
    const shopResult = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    const shop = shopResult[0];
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    if (shop.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!shop.chatbot_enabled) {
      return res.json({ enabled: false });
    }
    
    // Get subscription
    const subResult = await db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.shop_id, shopId),
        eq(subscriptions.feature, 'chatbot')
      ))
      .limit(1);
    
    // Try to get config from chatbot-node
    let config = null;
    try {
      config = await chatbotIntegration.getChatbotConfig(shopId);
    } catch (error) {
      console.warn('Failed to fetch chatbot config:', error.message);
    }
    
    res.json({
      enabled: true,
      botId: shop.chatbot_bot_id,
      enabledAt: shop.chatbot_enabled_at,
      subscription: subResult[0] || null,
      config: config || null,
    });
  } catch (error) {
    console.error('Get chatbot status error:', error);
    res.status(500).json({ error: 'Request failed' });
  }
});

// Issue SSO token for EverShop Admin
app.post('/api/shops/:id/sso/issue', requireAuth, async (req, res) => {
  try {
    const shopId = parseInt(req.params.id, 10);
    const { role } = req.body || {};
    
    const shopResult = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    const shop = shopResult[0];
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    if (shop.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const token = await chatbotIntegration.issueSSOToken(shopId, role || 'admin');
    
    res.json({ 
      token,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error('SSO token issue error:', error);
    res.status(500).json({ error: 'Failed to issue token', message: error.message });
  }
});

// Get credit transactions
app.get('/api/billing/transactions', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const transactions = await creditService.getTransactions(req.user.id, limit);
    const currentBalance = await creditService.getBalance(req.user.id);
    
    res.json({
      transactions,
      currentBalance,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// ===== End Chatbot Integration Routes =====

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`shopsaas listening on ${port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, starting graceful shutdown...');
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // Cleanup deployment monitors
      deploymentMonitor.cleanup();
      
      // Close queue and Redis connections
      await closeQueue();
      
      // Close database connections
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force close after timeout
  setTimeout(() => {
    console.log('Forcing shutdown after timeout');
    process.exit(1);
  }, 15000); // Increased timeout for queue cleanup
});

process.on('SIGINT', () => {
  console.log('SIGINT received, starting graceful shutdown...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      deploymentMonitor.cleanup();
      await closeQueue();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

console.log('✅ ShopSaaS control panel is ready!');
console.log(`🌐 Access the dashboard at: http://localhost:${port}`);
console.log(`🔧 Admin API available at: http://localhost:${port}/api`);
console.log(`📊 Active monitors: ${deploymentMonitor.getActiveMonitorsCount()}`);
