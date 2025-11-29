// shopsaas/scripts/seed.js
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, shops, credit_transactions } = require('../src/db/schema.js');
// Note: Adjust path to schema based on actual project structure if different.
// Assuming 'src/db/schema.js' is the location.

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is missing');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log('Seeding database...');

  try {
    // 1. Create Default User (Dr. Sell Admin)
    const userEmail = 'admin@drsell.com';
    let user = await db.select().from(users).where({ email: userEmail }).limit(1);
    
    if (user.length === 0) {
      console.log('Creating default user...');
      const result = await db.insert(users).values({
        email: userEmail,
        name: 'Dr. Sell Admin',
        password_hash: '$2b$10$EpRnTzVlqHNP0.fKb.U9H.micro/cf/h/fakehash', // Placeholder hash
        email_verified: true,
        credits: 1000, // Initial credits
        first_shop_redeemed: false
      }).returning();
      user = result[0];
    } else {
      user = user[0];
      console.log('Default user already exists.');
    }

    // 2. Create Initial Shops
    const shopList = [
      { name: 'Modern Gadgets Co.', slug: 'modern-gadgets', status: 'active', chatbot: true },
      { name: 'Vintage Finds', slug: 'vintage-finds', status: 'active', chatbot: false }
    ];

    for (const shopData of shopList) {
      const existing = await db.select().from(shops).where({ slug: shopData.slug }).limit(1);
      if (existing.length === 0) {
        console.log(`Creating shop: ${shopData.name}`);
        await db.insert(shops).values({
          user_id: user.id,
          shop_name: shopData.name,
          slug: shopData.slug,
          app_name: `evershop-fly-${shopData.slug}`,
          status: shopData.status,
          admin_email: user.email,
          chatbot_enabled: shopData.chatbot
        });
      }
    }

    // 3. Create Initial Transaction History
    const txCount = await db.select().from(credit_transactions).where({ user_id: user.id });
    if (txCount.length === 0) {
        console.log('Creating initial transactions...');
        await db.insert(credit_transactions).values([
            {
                user_id: user.id,
                amount: 1000,
                reason: 'initial_grant',
                balance_after: 1000
            }
        ]);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
