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

import { testConnection } from './db/index.js';
import passport from './auth/config.js';
import { sendMagicLink, verifyEmailToken } from './auth/email.js';
import { db } from './db/index.js';
import { users, shops, deployments, audit_logs } from './db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { flyClient } from './services/fly.js';
import { githubClient } from './services/github.js';
import { deploymentMonitor } from './services/deployment-monitor.js';
import { QueueManager, closeQueue } from './services/queue.js';

const app = express();

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

// Test database connection on startup
await testConnection();

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
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    logAuditEvent(req.user.id, 'login', 'user', req.user.id.toString(), { method: 'google' }, req);
    res.redirect(process.env.FRONTEND_URL || '/');
  }
);

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    logAuditEvent(req.user.id, 'login', 'user', req.user.id.toString(), { method: 'github' }, req);
    res.redirect(process.env.FRONTEND_URL || '/');
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
app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  
  const { password_hash, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
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

    const ownerRepo = process.env.GH_REPO; // e.g. "shygoly/evershop-fly"
    const workflow = process.env.GH_WORKFLOW || 'deploy-new-shop.yml';
    const ghToken = process.env.GITHUB_TOKEN; // repo scope
    if (!ownerRepo || !ghToken) {
      return res.status(501).json({ error: 'Server not configured: GH_REPO or GITHUB_TOKEN missing' });
    }

    const slug = makeSlug(shop_name);
    const appName = `evershop-fly-${slug}`;

    // Check if shop name/slug is already taken
    const existingShop = await db.select().from(shops).where(
      eq(shops.slug, slug)
    ).limit(1);
    
    if (existingShop.length > 0) {
      return res.status(409).json({ error: 'Shop name already taken', slug });
    }

    // Create shop record in database
    const newShop = await db.insert(shops).values({
      user_id: req.user.id,
      shop_name,
      slug,
      app_name: appName,
      admin_email,
      status: 'creating',
    }).returning();

    const shop = newShop[0];

    // Create deployment record
    const newDeployment = await db.insert(deployments).values({
      shop_id: shop.id,
      status: 'queued',
    }).returning();

    try {
      const shopData = {
        shop_id: shop.id,
        shop_name,
        slug,
        app_name: appName,
        admin_email,
        admin_password,
      };

      // Try to use queue system first, fallback to direct processing
      try {
        console.log(`📋 Adding shop creation to queue: ${appName}`);
        const job = await QueueManager.addShopCreationJob(
          shopData,
          newDeployment[0].id,
          req.user.id
        );

        console.log(`✅ Shop creation job queued: ${job.id}`);
        
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
        { shop_name, app_name: appName, slug, job_id: job.id },
        req
      );

      // Determine response based on processing mode
      const logs = JSON.parse(await db.select({ logs: deployments.logs })
        .from(deployments)
        .where(eq(deployments.id, newDeployment[0].id))
        .then(results => results[0]?.logs || '{}'));
      
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
    } catch (ghError) {
      // Update shop and deployment status on GitHub API failure
      await db.update(shops)
        .set({ status: 'failed' })
        .where(eq(shops.id, shop.id));
      
      await db.update(deployments)
        .set({ 
          status: 'failed',
          error_message: ghError?.response?.data?.message || ghError.message,
          completed_at: new Date()
        })
        .where(eq(deployments.id, newDeployment[0].id));
      
      throw ghError;
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
        created_at: shops.created_at,
        updated_at: shops.updated_at,
      })
      .from(shops)
      .where(eq(shops.user_id, req.user.id))
      .orderBy(desc(shops.created_at));

    res.json({ shops: userShops });
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
