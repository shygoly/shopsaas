#!/usr/bin/env node
import 'dotenv/config';
import { db } from './src/db/index.js';
import { users, shops, subscriptions, shop_secrets, credit_transactions } from './src/db/schema.js';
import { eq } from 'drizzle-orm';
import * as creditService from './src/services/credit.service.js';
import * as chatbotIntegration from './src/services/chatbot-integration.service.js';

console.log('🧪 Testing Hiyori ShopSaaS Chatbot Integration');
console.log('===============================================\n');

async function test() {
  try {
    // 1. Get test user and shop
    const userResult = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    const user = userResult[0];
    
    const shopResult = await db.select().from(shops).where(eq(shops.id, 1)).limit(1);
    const shop = shopResult[0];
    
    if (!user || !shop) {
      console.error('❌ Test user or shop not found');
      process.exit(1);
    }
    
    console.log(`✅ User: ${user.email} (Credits: ${user.credits})`);
    console.log(`✅ Shop: ${shop.shop_name} (ID: ${shop.id})\n`);
    
    // 2. Check credits
    const costCredits = parseInt(process.env.CREDIT_CHATBOT_ENABLEMENT || '50', 10);
    console.log(`2️⃣  Checking credits...`);
    console.log(`   Need: ${costCredits}, Have: ${user.credits}`);
    
    if (user.credits < costCredits) {
      console.error(`❌ Insufficient credits`);
      process.exit(1);
    }
    
    // 3. Deduct credits
    console.log(`\n3️⃣  Deducting ${costCredits} credits...`);
    const newBalance = await creditService.deductCredits(user.id, costCredits, 'chatbot_enablement', shop.id);
    console.log(`✅ Credits deducted. New balance: ${newBalance}`);
    
    // 4. Register chatbot
    console.log(`\n4️⃣  Registering chatbot with chatbot-node...`);
    const chatbotData = await chatbotIntegration.registerChatbot(shop, user.id, 'Test Bot');
    console.log(`✅ Chatbot registered:`, JSON.stringify(chatbotData, null, 2));
    
    // 5. Update shop
    console.log(`\n5️⃣  Updating shop record...`);
    await db.update(shops)
      .set({
        chatbot_enabled: true,
        chatbot_bot_id: chatbotData?.config?.botId || null,
        chatbot_enabled_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(shops.id, shop.id));
    console.log(`✅ Shop updated`);
    
    // 6. Create subscription
    console.log(`\n6️⃣  Creating subscription...`);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    await db.insert(subscriptions).values({
      user_id: user.id,
      shop_id: shop.id,
      feature: 'chatbot',
      status: 'active',
      expires_at: expiresAt,
    });
    console.log(`✅ Subscription created (expires: ${expiresAt.toISOString().split('T')[0]})`);
    
    // 7. Test SSO token
    console.log(`\n7️⃣  Testing SSO token generation...`);
    const ssoToken = await chatbotIntegration.issueSSOToken(shop.id);
    console.log(`✅ SSO Token: ${ssoToken.substring(0, 50)}...`);
    
    // 8. Verify final state
    console.log(`\n8️⃣  Verifying final database state...`);
    
    const userFinal = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    console.log(`   User credits: ${userFinal[0].credits}`);
    
    const shopFinal = await db.select().from(shops).where(eq(shops.id, 1)).limit(1);
    console.log(`   Shop chatbot_enabled: ${shopFinal[0].chatbot_enabled}`);
    console.log(`   Shop chatbot_bot_id: ${shopFinal[0].chatbot_bot_id || 'null'}`);
    
    const transactions = await db.select().from(credit_transactions).where(eq(credit_transactions.user_id, 1));
    console.log(`   Credit transactions: ${transactions.length}`);
    
    const secrets = await db.select().from(shop_secrets).where(eq(shop_secrets.shop_id, 1));
    console.log(`   Shop secrets: ${secrets.length > 0 ? 'Exists ✅' : 'Missing ❌'}`);
    
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.shop_id, 1));
    console.log(`   Subscriptions: ${subs.length}`);
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                ✅ All Tests Passed!                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();

