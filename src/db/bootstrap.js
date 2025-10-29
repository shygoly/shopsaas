import pg from 'pg';

const { Pool } = pg;

// Bootstrap DDL to ensure required tables/columns exist
export async function ensureDatabaseBootstrap() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ensure users table exists (minimal schema compatible with app usage)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        email varchar(255) UNIQUE NOT NULL,
        password_hash varchar(255),
        name varchar(255),
        avatar_url text,
        email_verified boolean DEFAULT false,
        credits integer DEFAULT 0,
        first_shop_redeemed boolean DEFAULT false,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // users optional columns
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_verified_at timestamp,
        ADD COLUMN IF NOT EXISTS last_login_at timestamp,
        ADD COLUMN IF NOT EXISTS password_reset_token varchar(255),
        ADD COLUMN IF NOT EXISTS password_reset_expires timestamp,
        ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS first_shop_redeemed boolean DEFAULT false
    `);

    // oauth_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        provider varchar(50) NOT NULL,
        provider_id varchar(255) NOT NULL,
        provider_data jsonb,
        created_at timestamp DEFAULT now()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS oauth_provider_idx ON oauth_accounts(provider, provider_id)`);

    // shops table (minimal columns used by app)
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        shop_name varchar(255) NOT NULL,
        slug varchar(100) UNIQUE NOT NULL,
        app_name varchar(100) UNIQUE NOT NULL,
        admin_email varchar(255),
        domain varchar(255),
        status varchar(50) DEFAULT 'creating',
        plan varchar(50) DEFAULT 'free',
        config jsonb,
        expires_at timestamp,
        chatbot_enabled boolean DEFAULT false,
        chatbot_bot_id varchar(100),
        chatbot_enabled_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // deployments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deployments (
        id serial PRIMARY KEY,
        shop_id integer REFERENCES shops(id) ON DELETE CASCADE,
        status varchar(50) DEFAULT 'queued',
        logs jsonb,
        github_run_id varchar(100),
        error_message text,
        started_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        completed_at timestamp
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS deployments_shop_idx ON deployments(shop_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS deployments_status_idx ON deployments(status)`);

    // subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        shop_id integer REFERENCES shops(id) ON DELETE CASCADE,
        feature varchar(50) NOT NULL,
        status varchar(50) DEFAULT 'active',
        expires_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS subscription_shop_idx ON subscriptions(shop_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS subscription_feature_idx ON subscriptions(feature)`);
    await client.query(`CREATE INDEX IF NOT EXISTS subscription_status_idx ON subscriptions(status)`);

    // shop_secrets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shop_secrets (
        id serial PRIMARY KEY,
        shop_id integer UNIQUE REFERENCES shops(id) ON DELETE CASCADE,
        sso_secret varchar(255) NOT NULL,
        webhook_secret varchar(255) NOT NULL,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // credit_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        amount integer NOT NULL,
        reason varchar(100) NOT NULL,
        related_shop_id integer,
        balance_after integer NOT NULL,
        created_at timestamp DEFAULT now()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS credit_user_idx ON credit_transactions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS credit_created_idx ON credit_transactions(created_at)`);

    // shops optional columns for limits/runtime (idempotent)
    await client.query(`
      ALTER TABLE IF EXISTS shops
        ADD COLUMN IF NOT EXISTS admin_email varchar(255),
        ADD COLUMN IF NOT EXISTS plan varchar(50) DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS config jsonb,
        ADD COLUMN IF NOT EXISTS expires_at timestamp,
        ADD COLUMN IF NOT EXISTS deployed_image varchar(500),
        ADD COLUMN IF NOT EXISTS deployed_at timestamp,
        ADD COLUMN IF NOT EXISTS machine_id varchar(100),
        ADD COLUMN IF NOT EXISTS machine_config jsonb,
        ADD COLUMN IF NOT EXISTS runtime_metrics jsonb
    `);

    // deployments optional columns
    await client.query(`
      ALTER TABLE IF EXISTS deployments
        ADD COLUMN IF NOT EXISTS started_at timestamp
    `);

    // audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE SET NULL,
        action varchar(100) NOT NULL,
        resource_type varchar(50),
        resource_id varchar(100),
        details jsonb,
        ip_address varchar(50),
        user_agent text,
        created_at timestamp DEFAULT now()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS audit_user_idx ON audit_logs(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_logs(action)`);
    await client.query(`CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at)`);

    // email_tokens table
    await client.query(`\n      CREATE TABLE IF NOT EXISTS email_tokens (\n        id serial PRIMARY KEY,\n        email varchar(255) NOT NULL,\n        token uuid NOT NULL,\n        token_type varchar(50) NOT NULL,\n        expires_at timestamp NOT NULL,\n        used boolean DEFAULT false,\n        created_at timestamp DEFAULT now()\n      )\n    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS email_token_idx ON email_tokens(token)`);
    await client.query(`CREATE INDEX IF NOT EXISTS email_type_idx ON email_tokens(email, token_type)`);

    // session table for connect-pg-simple
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp NOT NULL
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire)`);

    await client.query('COMMIT');
    console.log('✅ Database bootstrap ensured (tables/columns present)');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Database bootstrap failed:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}
