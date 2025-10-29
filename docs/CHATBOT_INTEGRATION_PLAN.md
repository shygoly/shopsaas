# ShopSaaS Chatbot Integration Plan

## 项目背景

将智能客服功能集成到现有的 Hiyori ShopSaaS 平台，实现：
- 积分计费增强（智能客服功能）
- chatbot-node 后端对接
- EverShop 实例的智能客服自动配置
- SSO Token 签发和管理
- Webhook 密钥管理

## 现有架构分析

### 技术栈
- **框架**: Express.js + Drizzle ORM
- **数据库**: PostgreSQL
- **队列**: BullMQ + Redis
- **部署**: Fly.io + GitHub Actions
- **认证**: Passport.js (Google/GitHub/Email)

### 现有数据模型
- `users` - 用户账号（已有 `credits` 字段）
- `shops` - 店铺实例
- `deployments` - 部署记录
- `audit_logs` - 审计日志
- `oauth_accounts` - OAuth 账户

### 现有功能
- ✅ 用户注册/登录（多种方式）
- ✅ 店铺创建（GitHub Actions + Fly.io）
- ✅ 积分系统（首店免费，后续1000积分/店）
- ✅ 部署监控
- ✅ 审计日志

---

## 集成需求

### 新增功能

1. **智能客服功能开关**
   - 每个店铺可以独立启用/禁用
   - 启用时扣除 50 积分
   - 自动调用 chatbot-node 注册租户

2. **SSO Token 管理**
   - 为每个店铺生成 SSO 密钥
   - 签发短期 Token（1小时）
   - 供 EverShop Admin 调用 chatbot-node

3. **Webhook 密钥管理**
   - 每个店铺生成独立 Webhook 密钥
   - 供 EverShop 发送 Webhook 到 chatbot-node

4. **Dashboard 界面增强**
   - 显示每个店铺的智能客服状态
   - "启用智能客服"按钮（-50积分）
   - 配置链接（跳转到 chatbot-node 管理界面）

---

## 数据模型扩展

### 1. 修改现有表

#### users 表
```javascript
// 已有 credits 字段，无需修改
export const users = pgTable('users', {
  // ... existing fields
  credits: integer('credits').default(0), // 已存在
  first_shop_redeemed: boolean('first_shop_redeemed').default(false), // 已存在
});
```

#### shops 表
```javascript
export const shops = pgTable('shops', {
  // ... existing fields
  chatbot_enabled: boolean('chatbot_enabled').default(false), // 新增
  chatbot_bot_id: varchar('chatbot_bot_id', { length: 100 }), // 新增：Coze bot ID
  chatbot_enabled_at: timestamp('chatbot_enabled_at'), // 新增：启用时间
});
```

### 2. 新增表

#### subscriptions 表
```javascript
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id, { onDelete: 'cascade' }),
  shop_id: serial('shop_id').references(() => shops.id, { onDelete: 'cascade' }),
  feature: varchar('feature', { length: 50 }).notNull(), // 'chatbot'
  status: varchar('status', { length: 50 }).default('active'), // active, expired, cancelled
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  shop_idx: index('subscription_shop_idx').on(table.shop_id),
  feature_idx: index('subscription_feature_idx').on(table.feature),
}));
```

#### shop_secrets 表
```javascript
export const shop_secrets = pgTable('shop_secrets', {
  id: serial('id').primaryKey(),
  shop_id: serial('shop_id').references(() => shops.id, { onDelete: 'cascade' }).unique(),
  sso_secret: varchar('sso_secret', { length: 255 }).notNull(), // JWT 签名密钥
  webhook_secret: varchar('webhook_secret', { length: 255 }).notNull(), // Webhook HMAC 密钥
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
```

#### credit_transactions 表（可选，审计用）
```javascript
export const credit_transactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // positive=credit, negative=debit
  reason: varchar('reason', { length: 100 }).notNull(), // 'shop_creation', 'chatbot_enablement', 'topup'
  related_shop_id: integer('related_shop_id'),
  balance_after: integer('balance_after').notNull(),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  user_idx: index('credit_user_idx').on(table.user_id),
  created_idx: index('credit_created_idx').on(table.created_at),
}));
```

---

## API 端点扩展

### 新增 API

#### 1. `POST /api/shops/:id/chatbot/enable`
启用智能客服功能

**请求**:
```json
{
  "botName": "Shop Assistant" // optional
}
```

**流程**:
1. 验证用户权限（shop 所有者）
2. 检查积分余额（>= 50）
3. 扣除 50 积分
4. 生成 SSO 和 Webhook 密钥
5. 调用 chatbot-node `/api/admin/tenants/register`
6. 更新 shop 表 `chatbot_enabled = true`
7. 创建 subscription 记录
8. 记录 credit_transaction
9. 记录 audit_log

**响应**:
```json
{
  "success": true,
  "botId": "756625...",
  "creditsRemaining": 950
}
```

#### 2. `GET /api/shops/:id/chatbot/status`
获取智能客服状态

**响应**:
```json
{
  "enabled": true,
  "botId": "756625...",
  "botName": "Shop Assistant",
  "syncScopes": ["products", "orders"],
  "subscription": {
    "status": "active",
    "expiresAt": "2025-11-29T..."
  }
}
```

#### 3. `POST /api/shops/:id/sso/issue`
签发 SSO Token（供 EverShop Admin 使用）

**请求**:
```json
{
  "role": "admin" // or "viewer"
}
```

**响应**:
```json
{
  "token": "eyJhbGci...",
  "expiresIn": 3600
}
```

#### 4. `GET /api/billing/transactions`
查询积分流水

**响应**:
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": -50,
      "reason": "chatbot_enablement",
      "relatedShopId": 1,
      "balanceAfter": 950,
      "createdAt": "2025-10-29T..."
    }
  ],
  "currentBalance": 950
}
```

---

## 服务层实现

### 1. src/services/credit.service.js

```javascript
import { db } from '../db/index.js';
import { users, credit_transactions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function deductCredits(userId, amount, reason, relatedShopId = null) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) throw new Error('User not found');
  
  const currentBalance = user[0].credits || 0;
  if (currentBalance < amount) {
    throw new Error('Insufficient credits');
  }
  
  const newBalance = currentBalance - amount;
  
  // Transaction
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ credits: newBalance, updated_at: new Date() })
      .where(eq(users.id, userId));
    
    await tx.insert(credit_transactions).values({
      user_id: userId,
      amount: -amount,
      reason,
      related_shop_id: relatedShopId,
      balance_after: newBalance,
    });
  });
  
  return newBalance;
}

export async function getBalance(userId) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user[0]?.credits || 0;
}

export async function getTransactions(userId, limit = 50) {
  return db.select()
    .from(credit_transactions)
    .where(eq(credit_transactions.user_id, userId))
    .orderBy(desc(credit_transactions.created_at))
    .limit(limit);
}
```

### 2. src/services/chatbot-integration.service.js

```javascript
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { shop_secrets } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const CHATBOT_BASE_URL = process.env.CHATBOT_BASE_URL || 'http://localhost:3000';
const CHATBOT_SHARED_SECRET = process.env.CHATBOT_SHARED_SECRET;

export async function registerChatbot(shop, userId, botName) {
  // Generate secrets for this shop
  const ssoSecret = uuidv4();
  const webhookSecret = uuidv4();
  
  // Save secrets
  await db.insert(shop_secrets).values({
    shop_id: shop.id,
    sso_secret: ssoSecret,
    webhook_secret: webhookSecret,
  });
  
  // Call chatbot-node
  const response = await axios.post(
    `${CHATBOT_BASE_URL}/api/admin/tenants/register`,
    {
      shopId: `shop-${shop.id}`,
      merchantId: String(userId),
      instanceUrl: shop.domain || `https://${shop.app_name}.fly.dev`,
      ssoType: 'shared',
      ssoSharedSecret: ssoSecret,
      webhookSecret,
      botName: botName || `${shop.shop_name} Assistant`,
    },
    {
      headers: {
        'x-shopsaas-secret': CHATBOT_SHARED_SECRET,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

export async function issueSSOToken(shopId, role = 'admin') {
  const secrets = await db.select()
    .from(shop_secrets)
    .where(eq(shop_secrets.shop_id, shopId))
    .limit(1);
  
  if (!secrets[0]) throw new Error('Shop secrets not found');
  
  const token = jwt.sign(
    { shopId: `shop-${shopId}`, role },
    secrets[0].sso_secret,
    {
      issuer: 'shopsaas',
      audience: 'chatbot-node',
      expiresIn: '1h',
    }
  );
  
  return token;
}

export async function getChatbotConfig(shopId) {
  const ssoToken = await issueSSOToken(shopId);
  
  const response = await axios.get(
    `${CHATBOT_BASE_URL}/api/admin/tenants/shop-${shopId}/config`,
    {
      headers: { Authorization: `Bearer ${ssoToken}` },
    }
  );
  
  return response.data;
}
```

---

## Dashboard 界面集成

### 修改 public/dashboard.html

#### 1. 顶部积分显示（已存在，保持不变）
```html
<div>
  <div class="muted">Credits</div>
  <div id="credits">-</div>
</div>
```

#### 2. 店铺卡片增强
```html
<div class="shop">
  <div>
    <h3>{shop_name}</h3>
    <div class="muted">
      {app_name} | Status: {status}
      <!-- 新增 -->
      <span id="chatbot-status-{id}">
        {chatbot_enabled ? '✅ 智能客服已启用' : ''}
      </span>
    </div>
  </div>
  <div class="actions">
    <button onclick="viewAdmin('{app_name}')">View Admin</button>
    <!-- 新增 -->
    {!chatbot_enabled && (
      <button class="primary" onclick="enableChatbot({id})">
        启用智能客服 (-50积分)
      </button>
    )}
    {chatbot_enabled && (
      <button onclick="viewChatbotConfig({id})">
        智能客服配置
      </button>
    )}
  </div>
</div>
```

#### 3. JavaScript 函数新增
```javascript
async function enableChatbot(shopId) {
  if (!confirm('启用智能客服将扣除 50 积分，确认继续？')) return;
  
  try {
    const response = await fetch(`/api/shops/${shopId}/chatbot/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`✅ 智能客服启用成功！Bot ID: ${data.botId}`);
      location.reload();
    } else {
      alert(`❌ 启用失败: ${data.error}`);
    }
  } catch (error) {
    alert(`❌ 请求失败: ${error.message}`);
  }
}

async function viewChatbotConfig(shopId) {
  // 获取 SSO Token 并跳转到 chatbot-node 配置页面
  const response = await fetch(`/api/shops/${shopId}/sso/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' })
  });
  
  const data = await response.json();
  const chatbotUrl = `${CHATBOT_BASE_URL}/admin?token=${data.token}&shopId=shop-${shopId}`;
  window.open(chatbotUrl, '_blank');
}
```

---

## 部署自动化集成

### EverShop 部署时注入环境变量

修改 GitHub Actions workflow 或部署脚本，在创建 EverShop 实例时自动注入：

```bash
# In provision-shop.sh or GitHub Actions
fly secrets set \
  SHOP_ID=shop-${SHOP_ID} \
  CHATBOT_BASE_URL=${CHATBOT_BASE_URL} \
  WEBHOOK_SECRET=${WEBHOOK_SECRET} \
  SHOPSAAS_BASE_URL=${SHOPSAAS_BASE_URL} \
  -a ${APP_NAME}
```

---

## 实施步骤

### Phase 1: 数据库扩展
1. 修改 `src/db/schema.js`
   - 在 shops 表添加 chatbot 相关字段
   - 新增 subscriptions 表
   - 新增 shop_secrets 表
   - 新增 credit_transactions 表
2. 运行数据库迁移
   ```bash
   npm run db:generate
   npm run db:push
   ```

### Phase 2: 服务层实现
1. 创建 `src/services/credit.service.js`
2. 创建 `src/services/chatbot-integration.service.js`
3. 更新现有的 shop 创建逻辑（记录 credit_transaction）

### Phase 3: API 路由扩展
1. 在 `src/server.js` 添加新路由：
   - `POST /api/shops/:id/chatbot/enable`
   - `GET /api/shops/:id/chatbot/status`
   - `POST /api/shops/:id/sso/issue`
   - `GET /api/billing/transactions`

### Phase 4: 前端界面集成
1. 修改 `public/dashboard.html`
   - 在 `loadShops()` 中添加 chatbot 状态显示
   - 添加 `enableChatbot()` 函数
   - 添加 `viewChatbotConfig()` 函数
2. CSS 样式微调（可选）

### Phase 5: 部署脚本更新
1. 修改 `scripts/provision-shop.sh`
   - 添加 Webhook Secret 生成
   - 注入到 Fly Secrets

### Phase 6: 测试验证
1. 本地测试完整流程
2. Playwright 自动化测试
3. 生产环境部署验证

---

## 配置清单

### 环境变量新增

在 `.env` 添加：

```env
# Chatbot Integration
CHATBOT_BASE_URL=https://chatbot-node.fly.dev
CHATBOT_SHARED_SECRET=<32-char-random-string>

# Credit Pricing
CREDIT_CHATBOT_ENABLEMENT=50
```

---

## 回退方案

如果集成出现问题：

1. **数据库回退**: 使用数据库备份恢复
2. **功能降级**: 设置 `CHATBOT_FEATURE_ENABLED=false` 隐藏智能客服功能
3. **代码回退**: Git revert 到集成前的 commit

---

## 验收标准

### 必须通过的测试

- [ ] 用户可以启用智能客服（扣除 50 积分）
- [ ] 积分不足时显示错误提示
- [ ] chatbot-node 租户注册成功
- [ ] SSO Token 可以正确签发和验证
- [ ] Webhook 密钥正确分发到 EverShop
- [ ] Dashboard 正确显示智能客服状态
- [ ] 积分流水正确记录
- [ ] 审计日志完整

---

## 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| chatbot-node 服务不可用 | 启用失败 | 重试机制 + 错误提示 |
| 密钥生成冲突 | 安全问题 | 使用 UUID v4 |
| 数据库迁移失败 | 系统不可用 | 先在开发环境测试 |
| 积分计算错误 | 财务问题 | 事务处理 + 详细日志 |

---

## 时间估算

- Phase 1 (数据库): 30分钟
- Phase 2 (服务层): 1小时
- Phase 3 (API 路由): 1小时
- Phase 4 (前端界面): 45分钟
- Phase 5 (部署脚本): 30分钟
- Phase 6 (测试): 1小时

**总计**: ~5小时

---

**准备好开始实施了！**

