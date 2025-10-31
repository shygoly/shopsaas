import crypto from 'crypto';
import axios from 'axios';
import { flyClient } from './fly.js';

function generateBase64UrlSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function computeHostnames(appName, customDomain) {
  const hostname = customDomain && customDomain.trim().length > 0
    ? customDomain.trim()
    : `${appName}.fly.dev`;
  const baseUrl = `https://${hostname}`;
  const cookieDomain = hostname; // host-only by default
  return { hostname, baseUrl, cookieDomain };
}

async function maybeCreateR2AccessKeys() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return null;
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/access_keys`;
    const res = await axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });

    if (!res.data?.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(res.data?.errors || res.data)}`);
    }

    const accessKeyId = res.data?.result?.access_key_id;
    const secretAccessKey = res.data?.result?.secret_access_key;
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare API did not return access_key_id/secret_access_key');
    }
    return { accessKeyId, secretAccessKey };
  } catch (err) {
    console.warn('Failed to create R2 S3 access keys via Cloudflare API:', err.message);
    return null;
  }
}

export async function injectBaselineEnvVars(appName, options) {
  const {
    customDomain,
    shopId,
    s3: { enable = false } = {},
  } = options || {};

  const { baseUrl, cookieDomain } = computeHostnames(appName, customDomain);

  const sessionSecret = generateBase64UrlSecret(32);
  const sessionSecretPrev = ''; // dual-key rotation reserved slot

  const baseEnv = {
    HOST: '0.0.0.0',
    PORT: '3000',
    NODE_ENV: 'production',
    BASE_URL: baseUrl,
    COOKIE_DOMAIN: cookieDomain,
    SESSION_SECRET: sessionSecret,
    SESSION_SECRET_PREV: sessionSecretPrev,
    CHATBOT_ENABLED: 'false',
  };

  const s3Env = {};
  if (enable) {
    // Prefer static config from env; otherwise try to create a fresh pair
    let accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    let secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      const created = await maybeCreateR2AccessKeys();
      if (created) {
        accessKeyId = created.accessKeyId;
        secretAccessKey = created.secretAccessKey;
      }
    }

    if (accessKeyId && secretAccessKey) {
      s3Env.AWS_ACCESS_KEY_ID = accessKeyId;
      s3Env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
      s3Env.AWS_BUCKET_NAME = process.env.S3_BUCKET || 'shop-s3';
      s3Env.AWS_REGION = process.env.S3_REGION || 'auto';
      
      // R2 S3 API endpoint (for SDK uploads)
      if (process.env.S3_ENDPOINT) {
        s3Env.AWS_ENDPOINT_URL_S3 = process.env.S3_ENDPOINT;
      }
      
      // R2 public URL base (for browser access) - must use custom domain, NOT API endpoint!
      s3Env.PUBLIC_ASSET_BASE_URL = process.env.S3_PUBLIC_BASE_URL || 'https://r2.szchada.top';
      
      // R2 requires path-style access (bucket/key, not bucket.endpoint/key)
      s3Env.S3_FORCE_PATH_STYLE = 'true';
      
      // Note: S3_PREFIX per-shop isolation requires custom uploader logic, skipping for now
    } else {
      console.warn('S3 (R2) requested but AWS_ACCESS_KEY_ID/SECRET not available; skipping S3 env injection');
    }
  }

  const payload = { ...baseEnv, ...s3Env };
  const result = await flyClient.setSecrets(appName, payload);
  return { success: !!result.success, envKeys: Object.keys(payload), baseUrl };
}

export async function rotateSessionSecrets(appName) {
  // Readback is not possible; inject new set (prev <- current is best-effort if app exposes an endpoint)
  // Here we only generate a new current and move old current into prev as empty (app should accept PREV for verification if provided)
  const newSecret = generateBase64UrlSecret(32);
  const res = await flyClient.setSecrets(appName, {
    SESSION_SECRET_PREV: process.env.SESSION_SECRET || '',
    SESSION_SECRET: newSecret,
  });
  return { success: !!res.success };
}


