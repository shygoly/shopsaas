import { db } from '../db/index.js';
import { users, credit_transactions } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

/**
 * Deduct credits from user account
 * Uses database transaction to ensure consistency
 */
export async function deductCredits(userId, amount, reason, relatedShopId = null) {
  return await db.transaction(async (tx) => {
    // 1. Get current balance
    const userResult = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const currentBalance = user.credits || 0;
    
    // 2. Check sufficient credits
    if (currentBalance < amount) {
      throw new Error(`Insufficient credits: have ${currentBalance}, need ${amount}`);
    }
    
    // 3. Calculate new balance
    const newBalance = currentBalance - amount;
    
    // 4. Update user balance
    await tx.update(users)
      .set({ 
        credits: newBalance, 
        updated_at: new Date() 
      })
      .where(eq(users.id, userId));
    
    // 5. Record transaction
    await tx.insert(credit_transactions).values({
      user_id: userId,
      amount: -amount,
      reason,
      related_shop_id: relatedShopId,
      balance_after: newBalance,
    });
    
    console.log(`✅ Credits deducted: user=${userId}, amount=${amount}, reason=${reason}, balance=${newBalance}`);
    
    return newBalance;
  });
}

/**
 * Add credits to user account (topup, refund, etc)
 */
export async function addCredits(userId, amount, reason, relatedShopId = null) {
  return await db.transaction(async (tx) => {
    const userResult = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const currentBalance = user.credits || 0;
    const newBalance = currentBalance + amount;
    
    await tx.update(users)
      .set({ 
        credits: newBalance, 
        updated_at: new Date() 
      })
      .where(eq(users.id, userId));
    
    await tx.insert(credit_transactions).values({
      user_id: userId,
      amount: amount,
      reason,
      related_shop_id: relatedShopId,
      balance_after: newBalance,
    });
    
    console.log(`✅ Credits added: user=${userId}, amount=${amount}, reason=${reason}, balance=${newBalance}`);
    
    return newBalance;
  });
}

/**
 * Get user credit balance
 */
export async function getBalance(userId) {
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return userResult[0]?.credits || 0;
}

/**
 * Get credit transaction history
 */
export async function getTransactions(userId, limit = 50) {
  return await db.select()
    .from(credit_transactions)
    .where(eq(credit_transactions.user_id, userId))
    .orderBy(desc(credit_transactions.created_at))
    .limit(limit);
}

