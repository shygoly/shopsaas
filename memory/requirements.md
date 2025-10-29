# ShopSaaS Chatbot Integration - Requirements

## Functional Requirements

### FR1: Credit Pricing for Chatbot
- **As a** shop owner
- **I want to** enable AI chatbot for my shop by spending 50 credits
- **So that** I can provide intelligent customer service

**Acceptance Criteria**:
- User with >= 50 credits can enable chatbot
- User with < 50 credits sees error message
- Credits deducted immediately upon successful enablement
- Transaction recorded in credit_transactions table

### FR2: One-Click Chatbot Enablement
- **As a** shop owner
- **I want to** enable chatbot from the dashboard with one click
- **So that** I don't need to navigate complex setup flows

**Acceptance Criteria**:
- "启用智能客服 (-50积分)" button visible on shop card (if not enabled)
- Button disabled if insufficient credits
- Confirmation dialog shows before deduction
- Success message shows Bot ID
- Dashboard refreshes to show new status

### FR3: Chatbot Status Display
- **As a** shop owner
- **I want to** see if chatbot is enabled for each shop
- **So that** I know which shops have this feature

**Acceptance Criteria**:
- "✅ 智能客服已启用" badge shows on enabled shops
- Bot ID visible (if available)
- "智能客服配置" button to access settings

### FR4: SSO Token for EverShop Admin
- **As an** EverShop admin
- **I want to** access chatbot configuration securely
- **So that** I can manage sync settings without separate login

**Acceptance Criteria**:
- SSO token issued with shop-specific secret
- Token valid for 1 hour
- Token includes shopId and role claims
- chatbot-node accepts and verifies token

### FR5: Webhook Secret Management
- **As a** system
- **I want to** securely distribute webhook secrets to EverShop
- **So that** webhooks can be verified by chatbot-node

**Acceptance Criteria**:
- Unique secret generated per shop
- Secret stored in shop_secrets table
- Secret injected into EverShop Fly Secrets
- Same secret registered in chatbot-node

---

## Non-Functional Requirements

### NFR1: Performance
- API response time < 200ms (excluding chatbot-node calls)
- chatbot-node registration < 5s
- Database queries use indexes
- No N+1 query problems

### NFR2: Security
- JWT signed with shop-specific secrets (not global)
- Webhook HMAC uses shop-specific secrets
- Secrets never exposed in API responses
- All operations logged in audit_logs

### NFR3: Reliability
- Credit deduction uses database transaction
- Retry logic for chatbot-node calls
- Graceful degradation if chatbot-node unavailable
- Clear error messages to users

### NFR4: Maintainability
- Code follows existing patterns
- Services in src/services/
- Routes in src/server.js
- Documentation in memory/ and docs/

---

## Data Model Requirements

### New Tables

#### subscriptions
- Purpose: Track feature subscriptions per shop
- Columns: id, user_id, shop_id, feature, status, expires_at, created_at, updated_at
- Indexes: shop_id, feature
- Relations: user_id → users.id, shop_id → shops.id

#### shop_secrets
- Purpose: Store SSO and webhook secrets per shop
- Columns: id, shop_id (unique), sso_secret, webhook_secret, created_at, updated_at
- Relations: shop_id → shops.id (cascade delete)

#### credit_transactions
- Purpose: Audit trail for all credit changes
- Columns: id, user_id, amount, reason, related_shop_id, balance_after, created_at
- Indexes: user_id, created_at
- Relations: user_id → users.id

### Modified Tables

#### shops (add columns)
- chatbot_enabled: boolean, default false
- chatbot_bot_id: varchar(100), nullable
- chatbot_enabled_at: timestamp, nullable

---

## API Requirements

### POST /api/shops/:id/chatbot/enable

**Auth**: Required (session)  
**Permission**: Shop owner only  

**Request**:
```json
{
  "botName": "Shop Assistant" // optional
}
```

**Validation**:
- Shop exists and belongs to user
- Shop not already chatbot-enabled
- User has >= 50 credits

**Process**:
1. Check prerequisites
2. Deduct 50 credits (transaction)
3. Generate SSO + Webhook secrets
4. Call chatbot-node /api/admin/tenants/register
5. Update shops.chatbot_enabled = true
6. Create subscription record
7. Log audit event

**Response**:
```json
{
  "success": true,
  "botId": "7566...",
  "creditsRemaining": 950,
  "subscription": {
    "expiresAt": "2025-11-29T..."
  }
}
```

**Error Handling**:
- 403: Not shop owner
- 402: Insufficient credits
- 409: Already enabled
- 500: chatbot-node registration failed (credits NOT deducted)

### GET /api/shops/:id/chatbot/status

**Auth**: Required  
**Permission**: Shop owner only  

**Response**:
```json
{
  "enabled": true,
  "botId": "7566...",
  "botName": "Shop Assistant",
  "syncScopes": ["products", "orders"],
  "subscription": {
    "status": "active",
    "expiresAt": "2025-11-29T..."
  }
}
```

### POST /api/shops/:id/sso/issue

**Auth**: Required  
**Permission**: Shop owner only  

**Request**:
```json
{
  "role": "admin" // or "viewer"
}
```

**Response**:
```json
{
  "token": "eyJhbGci...",
  "expiresIn": 3600
}
```

### GET /api/billing/transactions

**Auth**: Required  

**Query**: `?limit=50`

**Response**:
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": -50,
      "reason": "chatbot_enablement",
      "relatedShopName": "My Shop",
      "balanceAfter": 950,
      "createdAt": "2025-10-29T..."
    }
  ],
  "currentBalance": 950
}
```

---

## UI Requirements

### Dashboard Enhancements

#### Credits Display (existing)
- Keep current design
- No changes needed

#### Shop Card Enhancement
```
┌─────────────────────────────────────────────────┐
│ 📦 My Shop                                      │
│    evershop-fly-abc | Status: active            │
│    ✅ 智能客服已启用 | Bot: 7566...              │
│    [View Admin] [智能客服配置]                   │
└─────────────────────────────────────────────────┘

OR (if not enabled):

┌─────────────────────────────────────────────────┐
│ 📦 My Shop                                      │
│    evershop-fly-abc | Status: active            │
│    [View Admin] [启用智能客服 -50积分]           │
└─────────────────────────────────────────────────┘
```

#### Behavior
- Enable button shows only if:
  - chatbot_enabled = false
  - user has >= 50 credits
- Click triggers confirmation dialog
- On success: alert + page reload
- On error: alert with error message

---

## Integration with chatbot-node

### Registration Call

```javascript
POST chatbot-node/api/admin/tenants/register
Headers:
  x-shopsaas-secret: <CHATBOT_SHARED_SECRET>
Body:
{
  "shopId": "shop-123",
  "merchantId": "456",
  "instanceUrl": "https://my-shop.fly.dev",
  "ssoSharedSecret": "<generated-uuid>",
  "webhookSecret": "<generated-uuid>",
  "botName": "Shop Assistant"
}
```

### Expected Response

```json
{
  "tenant": { "shopId": "shop-123", ... },
  "config": { "botId": "7566...", ... }
}
```

---

## Testing Requirements

### Unit Tests
- Credit deduction logic
- SSO token generation/verification
- Webhook secret generation

### Integration Tests
- Full shop + chatbot enablement flow
- SSO token issuance and usage
- Error handling (insufficient credits)

### E2E Tests (Playwright)
- Login → Create Shop → Enable Chatbot
- Verify dashboard UI updates
- Test SSO token flow

---

## Documentation Requirements

- [ ] Update README.md (add chatbot feature)
- [ ] API documentation (new endpoints)
- [ ] Environment variables guide
- [ ] Integration testing guide
- [ ] Deployment checklist update

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Estimated Effort**: 5 hours

