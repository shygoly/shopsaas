# ShopSaaS Chatbot Integration - Implementation Plan

## Overview

Integrate AI chatbot capabilities into the existing Hiyori ShopSaaS platform with credit-based billing, SSO authentication, and seamless chatbot-node integration.

## Current State Analysis

### ✅ What Already Exists
- Express + Drizzle ORM + PostgreSQL architecture
- User authentication (Passport.js: Google/GitHub/Email)
- Shop creation with Fly.io deployment (GitHub Actions)
- Credit system (users.credits, first shop free, 1000 credits/shop)
- Dashboard UI (dashboard.html)
- Audit logging system
- BullMQ + Redis queue

### ❌ What's Missing
- Chatbot feature enablement
- SSO token issuance for EverShop → chatbot-node
- Webhook secret management
- chatbot-node API integration
- Dashboard UI for chatbot status/control

---

## Implementation Tasks

### Phase 1: Database Schema Extension

#### Task 1.1: Add chatbot fields to shops table
```sql
ALTER TABLE shops 
ADD COLUMN chatbot_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN chatbot_bot_id VARCHAR(100),
ADD COLUMN chatbot_enabled_at TIMESTAMP;
```

**File**: `src/db/schema.js`  
**Changes**: Add 3 fields to `shops` pgTable definition

#### Task 1.2: Create subscriptions table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX subscription_shop_idx ON subscriptions(shop_id);
CREATE INDEX subscription_feature_idx ON subscriptions(feature);
```

**File**: `src/db/schema.js`  
**Action**: Export new `subscriptions` pgTable

#### Task 1.3: Create shop_secrets table
```sql
CREATE TABLE shop_secrets (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER UNIQUE REFERENCES shops(id) ON DELETE CASCADE,
  sso_secret VARCHAR(255) NOT NULL,
  webhook_secret VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**File**: `src/db/schema.js`  
**Action**: Export new `shop_secrets` pgTable

#### Task 1.4: Create credit_transactions table
```sql
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  related_shop_id INTEGER,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX credit_user_idx ON credit_transactions(user_id);
CREATE INDEX credit_created_idx ON credit_transactions(created_at);
```

**File**: `src/db/schema.js`  
**Action**: Export new `credit_transactions` pgTable

#### Task 1.5: Run migration
```bash
cd /Users/mac/projects/ecommerce/shopsaas
npm run db:generate
npm run db:push
```

---

### Phase 2: Service Layer Implementation

#### Task 2.1: Create credit.service.js

**File**: `src/services/credit.service.js`  
**Functions**:
- `deductCredits(userId, amount, reason, relatedShopId)` - With transaction
- `addCredits(userId, amount, reason)` - For topup
- `getBalance(userId)` - Query current balance
- `getTransactions(userId, limit)` - Query history

**Key Logic**:
```javascript
export async function deductCredits(userId, amount, reason, relatedShopId = null) {
  return await db.transaction(async (tx) => {
    // 1. Get current balance
    const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    const current = user[0]?.credits || 0;
    
    // 2. Check sufficient
    if (current < amount) throw new Error('Insufficient credits');
    
    // 3. Update balance
    const newBalance = current - amount;
    await tx.update(users)
      .set({ credits: newBalance, updated_at: new Date() })
      .where(eq(users.id, userId));
    
    // 4. Record transaction
    await tx.insert(credit_transactions).values({
      user_id: userId,
      amount: -amount,
      reason,
      related_shop_id: relatedShopId,
      balance_after: newBalance,
    });
    
    return newBalance;
  });
}
```

#### Task 2.2: Create chatbot-integration.service.js

**File**: `src/services/chatbot-integration.service.js`  
**Functions**:
- `registerChatbot(shop, userId, botName)` - Register with chatbot-node
- `issueSSOToken(shopId, role)` - Sign JWT with shop secret
- `getChatbotConfig(shopId)` - Proxy call to chatbot-node
- `ensureSecrets(shopId)` - Generate if not exists

**Dependencies**: axios, jsonwebtoken, uuid

---

### Phase 3: API Routes Extension

#### Task 3.1: Add chatbot routes to server.js

**Location**: After existing `/api/shops` routes (around line 600)

**Routes to Add**:
```javascript
// Enable chatbot for a shop
app.post('/api/shops/:id/chatbot/enable', requireAuth, async (req, res) => {
  // Implementation here
});

// Get chatbot status
app.get('/api/shops/:id/chatbot/status', requireAuth, async (req, res) => {
  // Implementation here
});

// Issue SSO token
app.post('/api/shops/:id/sso/issue', requireAuth, async (req, res) => {
  // Implementation here
});

// Get credit transactions
app.get('/api/billing/transactions', requireAuth, async (req, res) => {
  // Implementation here
});
```

#### Task 3.2: Update existing shop creation route

**Location**: `POST /api/shops` (around line 463)  
**Changes**: 
- Replace inline credit deduction with `creditService.deductCredits()`
- Ensure credit_transactions is populated

---

### Phase 4: Dashboard UI Integration

#### Task 4.1: Modify loadShops() function

**File**: `public/dashboard.html`  
**Location**: JavaScript section (around line 150)

**Changes**:
```javascript
async function loadShops() {
  const res = await fetch('/api/shops');
  const data = await res.json();
  
  let html = '';
  for (const s of data.shops) {
    // Add chatbot status display
    const chatbotBadge = s.chatbot_enabled 
      ? `<span class="badge success">✅ 智能客服已启用</span>`
      : '';
    
    const chatbotButton = s.chatbot_enabled
      ? `<button onclick="viewChatbotConfig(${s.id})">智能客服配置</button>`
      : `<button class="primary" onclick="enableChatbot(${s.id})" ${userCredits < 50 ? 'disabled' : ''}>启用智能客服 (-50积分)</button>`;
    
    html += `
      <div class="shop">
        <div>
          <h3>${s.shop_name} ${chatbotBadge}</h3>
          <div class="muted">${s.app_name} | Status: ${s.status}</div>
        </div>
        <div class="actions">
          <button onclick="viewAdmin('${s.app_name}')">View Admin</button>
          ${chatbotButton}
        </div>
      </div>
    `;
  }
  // ...
}
```

#### Task 4.2: Add JavaScript functions

**File**: `public/dashboard.html`  
**Location**: JavaScript section

**Functions to Add**:
```javascript
async function enableChatbot(shopId) {
  if (!confirm('启用智能客服将扣除 50 积分。\n\n功能包括：\n• AI 对话助手\n• 产品/订单智能查询\n• 自动客服回复\n\n确认继续？')) {
    return;
  }
  
  try {
    const res = await fetch(`/api/shops/${shopId}/chatbot/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert(`✅ 智能客服启用成功！\n\nBot ID: ${data.botId}\n剩余积分: ${data.creditsRemaining}`);
      location.reload();
    } else {
      if (data.error === 'insufficient_credits') {
        alert(`❌ 积分不足\n\n需要: 50 积分\n当前: ${data.have} 积分\n\n请先充值！`);
      } else {
        alert(`❌ 启用失败: ${data.error}`);
      }
    }
  } catch (error) {
    alert(`❌ 请求失败: ${error.message}`);
  }
}

async function viewChatbotConfig(shopId) {
  try {
    const res = await fetch(`/api/shops/${shopId}/sso/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      const chatbotUrl = `${CHATBOT_BASE_URL}/admin?token=${data.token}&shopId=shop-${shopId}`;
      window.open(chatbotUrl, '_blank');
    } else {
      alert(`❌ 无法获取配置: ${data.error}`);
    }
  } catch (error) {
    alert(`❌ 请求失败: ${error.message}`);
  }
}
```

#### Task 4.3: Add CSS styles

**File**: `public/dashboard.html`  
**Location**: `<style>` section

**Add**:
```css
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}
.badge.success {
  background: #d4edda;
  color: #155724;
}
.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### Phase 5: Environment Configuration

#### Task 5.1: Update .env

Add to `.env`:
```env
# Chatbot Integration
CHATBOT_BASE_URL=https://chatbot-node.fly.dev
CHATBOT_SHARED_SECRET=shopsaas-chatbot-secret-dev-2024

# Credit Pricing
CREDIT_CHATBOT_ENABLEMENT=50
```

#### Task 5.2: Update .env.example

Document new variables for other developers

---

### Phase 6: Deployment Integration

#### Task 6.1: Update shop provisioning

**File**: `scripts/provision-shop.sh` (if exists) or inline in server.js

**Add** (when creating EverShop instance):
```bash
# Inject chatbot secrets if enabled
if [ "$CHATBOT_ENABLED" = "true" ]; then
  fly secrets set \
    SHOP_ID=shop-${SHOP_ID} \
    CHATBOT_BASE_URL=${CHATBOT_BASE_URL} \
    WEBHOOK_SECRET=${WEBHOOK_SECRET} \
    SHOPSAAS_BASE_URL=${SHOPSAAS_BASE_URL} \
    -a ${APP_NAME}
fi
```

---

### Phase 7: Testing

#### Task 7.1: Manual Testing
- Register user → Create shop → Enable chatbot
- Verify credits deducted correctly
- Verify chatbot-node registration
- Verify SSO token works
- Test insufficient credits error

#### Task 7.2: Playwright E2E Test

**File**: `e2e/chatbot-integration.spec.js`

```javascript
test('Complete chatbot enablement flow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/dashboard');
  
  // Create shop (if needed)
  // ...
  
  // Enable chatbot
  await page.click('text=启用智能客服');
  await page.click('button:has-text("确认")');
  
  // Verify success
  await expect(page.locator('text=智能客服已启用')).toBeVisible();
});
```

---

## File Change Summary

### New Files (3)
- `src/services/credit.service.js` (~150 lines)
- `src/services/chatbot-integration.service.js` (~120 lines)
- `e2e/chatbot-integration.spec.js` (~50 lines)

### Modified Files (3)
- `src/db/schema.js` - Add 4 new tables, extend shops
- `src/server.js` - Add 4 new API routes (~200 lines)
- `public/dashboard.html` - UI enhancements (~100 lines)

### Documentation Files (3)
- `memory/constitution.md` ✅
- `memory/requirements.md` ✅
- `docs/CHATBOT_INTEGRATION_PLAN.md` ✅

**Total Effort**: ~700 lines of new code

---

## Implementation Order

1. ✅ Constitution & Requirements (DONE)
2. → Database schema.js (4 new tables + shops extension)
3. → credit.service.js
4. → chatbot-integration.service.js  
5. → server.js routes (4 endpoints)
6. → dashboard.html UI
7. → .env configuration
8. → Database migration
9. → Local testing
10. → Playwright E2E test
11. → Production deployment

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking existing features | Test existing flows before/after |
| Database migration fails | Test in dev DB first, keep backup |
| chatbot-node unavailable | Graceful error, don't deduct credits |
| Credit calculation error | Use database transaction |
| SSO token conflict | Use per-shop UUID secrets |

---

## Rollback Plan

If integration fails:
1. Revert database migration (drop new tables)
2. Git revert code changes
3. Restore from database backup
4. Remove chatbot-related Fly Secrets from EverShop instances

---

**Status**: Ready for implementation  
**Next Step**: Execute Phase 2 (Database Schema)

