# ShopSaaS Chatbot Integration - Constitution

## Project Identity

**Name**: ShopSaaS Chatbot Integration  
**Type**: Feature Enhancement  
**Base**: Hiyori ShopSaaS (Express + Drizzle ORM)  
**Goal**: Integrate AI chatbot capabilities with credit-based billing

## Core Principles

### 1. Minimal Disruption
- Extend existing architecture, don't rebuild
- Preserve current user experience
- Maintain backward compatibility
- Reuse existing tables where possible (users.credits already exists)

### 2. Clean Integration
- Follow existing code patterns (Drizzle ORM, Express routes)
- Match existing naming conventions (snake_case for DB, camelCase for JS)
- Respect existing middleware (requireAuth, audit logging)
- Use existing queue system (BullMQ) if needed

### 3. Security First
- Per-shop SSO secrets (isolated JWT signing)
- Per-shop Webhook secrets (HMAC-SHA256)
- Reuse existing audit_logs table
- Follow existing authentication patterns

### 4. User-Centric Design
- Clear pricing display (-50 credits for chatbot)
- Inline feature enablement (no separate pages)
- Graceful error handling (insufficient credits)
- Consistent with existing dashboard UI

## Technical Constraints

### Must Use
- **ORM**: Drizzle (not Prisma)
- **DB Syntax**: snake_case columns, camelCase in JS
- **Auth**: Existing Passport.js session (req.user)
- **Logging**: Existing audit_logs pattern
- **File Structure**: src/services/, src/server.js routes

### Must Avoid
- Creating duplicate user/shop tables
- Breaking existing API contracts
- Changing authentication flow
- Modifying existing column types

## Integration Points

### Database
- **Extend**: users (add credit_balance if missing), shops (add chatbot_enabled)
- **New**: subscriptions, shop_secrets, credit_transactions

### Services
- **New**: credit.service.js, chatbot-integration.service.js
- **Modify**: None (keep existing shop/deployment services)

### Routes
- **Extend**: server.js (add chatbot-related routes)
- **Pattern**: `/api/shops/:id/chatbot/*` (RESTful)

### UI
- **Modify**: public/dashboard.html (add buttons, status display)
- **Keep**: Existing styles, structure, functions

## Success Criteria

1. User can enable chatbot with one click (if sufficient credits)
2. Credits deducted automatically (-50)
3. chatbot-node tenant registered successfully
4. SSO token can be issued and verified
5. Dashboard shows chatbot status clearly
6. All operations logged in audit_logs
7. No regression on existing features

## Non-Goals

- Building new admin UI (use existing dashboard)
- Replacing credit system (enhance existing)
- Changing deployment flow (keep GitHub Actions)
- Multi-currency support (credits only)

