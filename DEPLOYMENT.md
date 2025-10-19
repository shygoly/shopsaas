# ShopSaaS - Deployment Guide

## 🚀 MVP Deployment

This guide covers deploying the ShopSaaS MVP to production.

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- GitHub repository with EverShop template
- Fly.io account and API token
- Email service credentials
- OAuth app credentials (optional)

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL=postgres://user:password@host:5432/shopsaas

# Session
SESSION_SECRET=your-super-secret-session-key-change-in-production

# GitHub for deployment
GH_REPO=your-username/evershop-fly
GH_WORKFLOW=deploy-new-shop.yml
GITHUB_TOKEN=ghp_your_personal_access_token_with_repo_scope

# Fly.io API
FLY_API_TOKEN=your_fly_api_token

# Redis for queue system
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Queue configuration
SHOP_CREATION_CONCURRENCY=2

# Email service
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@shopsaas.com

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Webhook security (optional)
SHOPSAAS_WEBHOOK_SECRET=your-webhook-secret-key

# App configuration
NODE_ENV=production
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### Database Setup

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npm run db:generate
npm run db:push
```

3. Verify database connection:
```bash
npm run dev
# Check console for "✅ Database connected successfully"
```

### GitHub Actions Setup

1. Copy `.github/workflows/deploy-new-shop.yml` to your EverShop repository

2. Configure repository secrets in GitHub:
   - `FLY_API_TOKEN` - Your Fly.io API token
   - `DATABASE_URL` - Shared database connection string
   - `AWS_ACCESS_KEY_ID` - For R2/S3 storage
   - `AWS_SECRET_ACCESS_KEY` - For R2/S3 storage
   - `R2_ACCOUNT_ID` - Cloudflare R2 account ID
   - `R2_ACCESS_KEY_ID` - R2 access key
   - `R2_SECRET_ACCESS_KEY` - R2 secret key
   - `PUBLIC_ASSET_BASE_URL` - CDN URL for assets

3. Configure repository variables (optional):
   - `EVERSHOP_REPO` - Repository containing EverShop template
   - `SHOPSAAS_WEBHOOK_URL` - Your ShopSaaS webhook endpoint
   - `SHOPSAAS_WEBHOOK_SECRET` - Webhook authentication secret

### Fly.io Deployment

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login to Fly.io:
```bash
fly auth login
```

3. Initialize Fly app:
```bash
fly launch --no-deploy
```

4. Configure secrets:
```bash
fly secrets set DATABASE_URL="your-database-url"
fly secrets set SESSION_SECRET="your-session-secret"
fly secrets set GITHUB_TOKEN="your-github-token"
fly secrets set FLY_API_TOKEN="your-fly-api-token"
fly secrets set REDIS_HOST="your-redis-host"
fly secrets set SMTP_USER="your-smtp-user"
fly secrets set SMTP_PASS="your-smtp-password"
# Add other secrets as needed
```

5. Deploy:
```bash
fly deploy
```

### Health Checks

After deployment, verify the system:

1. **Basic Health Check**:
```bash
curl https://your-app.fly.dev/health
# Should return: {"ok":true}
```

2. **System Status**:
```bash
curl https://your-app.fly.dev/api/system/status
# Requires authentication - use browser or provide session
```

3. **Database Connection**:
Check application logs for "✅ Database connected successfully"

4. **Queue System**:
Check logs for queue worker startup messages

### Testing the MVP

#### Manual Test Checklist

1. **Authentication Flow**:
   - [ ] Visit homepage (`/`)
   - [ ] Test email magic link login
   - [ ] Test Google OAuth (if configured)
   - [ ] Test GitHub OAuth (if configured)
   - [ ] Verify user dashboard loads

2. **Shop Creation Flow**:
   - [ ] Fill shop creation form
   - [ ] Submit and verify job queued response
   - [ ] Check queue status in system admin panel
   - [ ] Monitor deployment progress
   - [ ] Verify email notification received
   - [ ] Test created shop URL

3. **System Administration**:
   - [ ] Access `/api/system/status`
   - [ ] View queue statistics
   - [ ] Test queue management (pause/resume/clean)

#### Automated Testing Script

```javascript
// test-mvp.js
const baseUrl = 'https://your-app.fly.dev';

async function testHealthCheck() {
  const response = await fetch(`${baseUrl}/health`);
  const data = await response.json();
  console.log('Health check:', data.ok ? '✅' : '❌');
}

async function testShopCreation(sessionCookie) {
  const response = await fetch(`${baseUrl}/api/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      shop_name: 'Test Shop ' + Date.now(),
      admin_email: 'admin@example.com',
      admin_password: 'secure-password-123'
    })
  });
  
  const data = await response.json();
  console.log('Shop creation:', response.ok ? '✅' : '❌', data);
}

// Run tests
testHealthCheck();
// testShopCreation('your-session-cookie');
```

### Monitoring and Maintenance

#### Log Monitoring

View application logs:
```bash
fly logs -a your-app-name
```

Key log messages to monitor:
- `✅ Database connected successfully`
- `🚀 Processing shop creation:`
- `✅ Workflow triggered successfully`
- `🎉 Shop deployment completed successfully:`
- `❌ Shop creation failed:`

#### Queue Monitoring

Access queue dashboard via API:
```bash
# Get queue statistics
curl "https://your-app.fly.dev/api/admin/queue/stats" \
  -H "Cookie: your-session-cookie"

# Clean old jobs
curl -X POST "https://your-app.fly.dev/api/admin/queue/clean" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"grace": 86400000}'  # 24 hours
```

#### Database Maintenance

Periodic cleanup tasks:
```bash
# Clean old audit logs (older than 30 days)
# Connect to database and run:
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';

# Clean old email tokens
DELETE FROM email_tokens WHERE expires_at < NOW() OR used = true;

# Clean old sessions
DELETE FROM session WHERE expire < EXTRACT(EPOCH FROM NOW()) * 1000;
```

### Troubleshooting

#### Common Issues

1. **Queue jobs stuck**:
   - Check Redis connection
   - Restart queue worker: `fly restart`
   - Clear failed jobs via API

2. **GitHub Actions not triggering**:
   - Verify `GITHUB_TOKEN` permissions
   - Check repository workflow file exists
   - Review GitHub Actions logs

3. **Fly.io provisioning fails**:
   - Check Fly.io account limits
   - Verify `FLY_API_TOKEN` validity
   - Review Fly.io dashboard for errors

4. **Email delivery issues**:
   - Verify SMTP credentials
   - Check email provider rate limits
   - Review spam folders

#### Debug Commands

```bash
# Check app status
fly status -a your-app-name

# View detailed logs
fly logs -a your-app-name --tail

# SSH into app for debugging
fly ssh console -a your-app-name

# Check secrets
fly secrets list -a your-app-name

# Scale app resources
fly scale memory 1024 -a your-app-name
fly scale count 2 -a your-app-name
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use Fly secrets for sensitive data
3. **Session Security**: Use strong `SESSION_SECRET` in production
4. **HTTPS Only**: Ensure all traffic uses HTTPS
5. **Rate Limiting**: Monitor API rate limits
6. **Database Security**: Use SSL connections and strong credentials

### Performance Optimization

1. **Queue Concurrency**: Adjust `SHOP_CREATION_CONCURRENCY` based on load
2. **Database Connections**: Monitor connection pool usage
3. **Redis Memory**: Monitor Redis memory usage for queue data
4. **App Scaling**: Scale Fly.io resources based on demand

### Backup Strategy

1. **Database Backups**: Implement regular PostgreSQL backups
2. **Redis Persistence**: Configure Redis persistence for queue durability
3. **Configuration Backup**: Keep environment configs in secure storage
4. **Code Repository**: Ensure code is properly version controlled

## 🎯 Production Readiness Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Redis server running
- [ ] GitHub Actions workflow configured
- [ ] Fly.io deployment successful
- [ ] Email service tested
- [ ] OAuth providers configured (optional)
- [ ] Health checks passing
- [ ] Queue system operational
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

The MVP is ready for production when all items above are completed! 🚀