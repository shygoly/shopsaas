import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { shop_secrets } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const CHATBOT_BASE_URL = process.env.CHATBOT_BASE_URL || 'http://localhost:3000';
const CHATBOT_SHARED_SECRET = process.env.CHATBOT_SHARED_SECRET;

/**
 * Register chatbot for a shop with chatbot-node
 */
export async function registerChatbot(shop, userId, botName) {
  // Generate secrets for this shop
  const ssoSecret = uuidv4();
  const webhookSecret = uuidv4();
  
  console.log(`🔐 Generating secrets for shop ${shop.id}...`);
  
  // Save secrets to database
  await db.insert(shop_secrets).values({
    shop_id: shop.id,
    sso_secret: ssoSecret,
    webhook_secret: webhookSecret,
  });
  
  console.log(`✅ Secrets saved for shop ${shop.id}`);
  
  // Call chatbot-node to register tenant
  try {
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
        timeout: 10000,
      }
    );
    
    console.log(`✅ Chatbot registered for shop ${shop.id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to register chatbot for shop ${shop.id}:`, error.message);
    throw new Error(`Chatbot registration failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Issue SSO token for EverShop Admin to access chatbot-node
 */
export async function issueSSOToken(shopId, role = 'admin') {
  const secretsResult = await db.select()
    .from(shop_secrets)
    .where(eq(shop_secrets.shop_id, shopId))
    .limit(1);
  
  if (!secretsResult[0]) {
    throw new Error('Shop secrets not found');
  }
  
  const token = jwt.sign(
    { shopId: `shop-${shopId}`, role },
    secretsResult[0].sso_secret,
    {
      issuer: 'shopsaas',
      audience: 'chatbot-node',
      expiresIn: '1h',
    }
  );
  
  console.log(`🔑 SSO token issued for shop ${shopId}`);
  
  return token;
}

/**
 * Get chatbot config from chatbot-node
 */
export async function getChatbotConfig(shopId) {
  const ssoToken = await issueSSOToken(shopId);
  
  try {
    const response = await axios.get(
      `${CHATBOT_BASE_URL}/api/admin/tenants/shop-${shopId}/config`,
      {
        headers: { Authorization: `Bearer ${ssoToken}` },
        timeout: 5000,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Failed to get chatbot config for shop ${shopId}:`, error.message);
    throw new Error(`Failed to get chatbot config: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Ensure secrets exist for a shop (generate if not)
 */
export async function ensureSecrets(shopId) {
  const secretsResult = await db.select()
    .from(shop_secrets)
    .where(eq(shop_secrets.shop_id, shopId))
    .limit(1);
  
  if (secretsResult[0]) {
    return secretsResult[0];
  }
  
  // Generate new secrets
  const ssoSecret = uuidv4();
  const webhookSecret = uuidv4();
  
  await db.insert(shop_secrets).values({
    shop_id: shopId,
    sso_secret: ssoSecret,
    webhook_secret: webhookSecret,
  });
  
  return { sso_secret: ssoSecret, webhook_secret: webhookSecret };
}

/**
 * Inject chatbot environment variables to EverShop Fly app
 */
export async function injectChatbotEnvVars(shop, ssoSecret, webhookSecret) {
  const FlyAPIClient = (await import('./fly.js')).default;
  const flyClient = new FlyAPIClient();
  
  const chatbotEnvVars = {
    CHATBOT_ENABLED: 'true',
    CHATBOT_NODE_URL: CHATBOT_BASE_URL,
    CHATBOT_SHOP_ID: `shop-${shop.id}`,
    CHATBOT_SSO_SECRET: ssoSecret,
    CHATBOT_WEBHOOK_SECRET: webhookSecret,
  };
  
  console.log(`🔧 Injecting chatbot env vars to ${shop.app_name}...`);
  
  try {
    const result = await flyClient.setSecrets(shop.app_name, chatbotEnvVars);
    
    if (result.success) {
      console.log(`✅ Chatbot env vars injected to ${shop.app_name}`);
      return true;
    } else {
      console.error(`❌ Failed to inject chatbot env vars: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error injecting chatbot env vars:`, error);
    return false;
  }
}

