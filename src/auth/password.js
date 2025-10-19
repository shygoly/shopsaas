import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { users, email_tokens } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from './email.js';

const SALT_ROUNDS = 12;

/**
 * 哈希密码
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * 密码登录
 */
export async function loginWithPassword(email, password) {
  try {
    // 查找用户
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userData = user[0];

    // 检查是否有密码（可能是 OAuth 用户）
    if (!userData.password_hash) {
      return { 
        success: false, 
        error: 'Password not set. Please use magic link or OAuth login.' 
      };
    }

    // 验证密码
    const isValid = await verifyPassword(password, userData.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }

    // 更新最后登录时间（列可能不存在，忽略错误）
    try {
      await db
        .update(users)
        .set({ 
          last_login_at: new Date(),
          updated_at: new Date()
        })
        .where(eq(users.id, userData.id));
    } catch (e) {
      console.warn('Optional column update failed (last_login_at):', e.message);
    }

    return { 
      success: true, 
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        email_verified: userData.email_verified
      }
    };
  } catch (error) {
    console.error('Password login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * 注册用户（带密码）
 */
export async function registerWithPassword(email, password, name = null) {
  try {
    email = email.toLowerCase();
    
    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // 如果用户存在但没有密码，允许设置密码
      if (!existingUser[0].password_hash) {
        const hashedPassword = await hashPassword(password);
        
        await db
          .update(users)
          .set({ 
            password_hash: hashedPassword,
            name: name || existingUser[0].name,
            updated_at: new Date()
          })
          .where(eq(users.id, existingUser[0].id));

        return { 
          success: true, 
          user: existingUser[0],
          message: 'Password set successfully'
        };
      }
      
      return { success: false, error: 'User already exists' };
    }

    // 创建新用户
    const hashedPassword = await hashPassword(password);
    
    const newUser = await db
      .insert(users)
      .values({
        email,
        password_hash: hashedPassword,
        name,
        email_verified: false
      })
      .returning();

    // 发送验证邮件
    await sendEmailVerification(email);

    return { 
      success: true, 
      user: newUser[0],
      message: 'Account created. Please verify your email.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * 发送邮箱验证邮件
 */
export async function sendEmailVerification(email) {
  try {
    email = email.toLowerCase();
    
    // 生成验证 token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 保存 token
    await db.insert(email_tokens).values({
      email,
      token,
      token_type: 'verification',
      expires_at: expiresAt
    });

    // 发送验证邮件
    const verificationUrl = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify your ShopSaaS account',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #667eea; font-size: 28px; margin-bottom: 8px;">ShopSaaS</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Verify your email address</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 32px; margin-bottom: 32px;">
            <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 16px;">Welcome to ShopSaaS!</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Please verify your email address to complete your account setup and start creating your online stores.
            </p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #667eea; color: white; text-decoration: none; 
                        padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              This verification link will expire in 24 hours.<br>
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Send verification error:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

/**
 * 验证邮箱
 */
export async function verifyEmail(token) {
  try {
    // 查找有效的验证 token
    const emailToken = await db
      .select()
      .from(email_tokens)
      .where(
        and(
          eq(email_tokens.token, token),
          eq(email_tokens.token_type, 'verification'),
          eq(email_tokens.used, false),
          gt(email_tokens.expires_at, new Date())
        )
      )
      .limit(1);

    if (emailToken.length === 0) {
      return { success: false, error: 'Invalid or expired verification token' };
    }

    const tokenData = emailToken[0];

    // 标记 token 为已使用
    await db
      .update(email_tokens)
      .set({ used: true })
      .where(eq(email_tokens.id, tokenData.id));

    // 更新用户邮箱验证状态
    await db
      .update(users)
      .set({ 
        email_verified: true,
        updated_at: new Date()
      })
      .where(eq(users.email, tokenData.email));

    // 可选设置验证时间（列可能不存在）
    try {
      await db
        .update(users)
        .set({ email_verified_at: new Date() })
        .where(eq(users.email, tokenData.email));
    } catch (e) {
      console.warn('Optional column update failed (email_verified_at):', e.message);
    }

    // 获取用户信息
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, tokenData.email))
      .limit(1);

    return { 
      success: true, 
      user: user[0],
      message: 'Email verified successfully!'
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordReset(email) {
  try {
    email = email.toLowerCase();
    
    // 检查用户是否存在
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      // 为了安全，即使用户不存在也返回成功
      return { success: true, message: 'If the email exists, a reset link has been sent.' };
    }

    // 生成重置 token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1小时后过期

    // 更新用户的重置 token（列可能不存在，忽略错误）
    try {
      await db
        .update(users)
        .set({ 
          password_reset_token: resetToken,
          password_reset_expires: expiresAt,
          updated_at: new Date()
        })
        .where(eq(users.id, user[0].id));
    } catch (e) {
      console.warn('Optional column update failed (password_reset_*):', e.message);
      // 仍然返回成功，避免泄露用户存在性
    }

    // 发送重置邮件
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset your ShopSaaS password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #667eea; font-size: 28px; margin-bottom: 8px;">ShopSaaS</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 32px; margin-bottom: 32px;">
            <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to create a new password for your ShopSaaS account.
            </p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #667eea; color: white; text-decoration: none; 
                        padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              This reset link will expire in 1 hour.<br>
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, message: 'If the email exists, a reset link has been sent.' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to send reset email' };
  }
}

/**
 * 重置密码
 */
export async function resetPassword(token, newPassword) {
  try {
    // 查找有效的重置 token
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.password_reset_token, token),
          gt(users.password_reset_expires, new Date())
        )
      )
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const userData = user[0];

    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码（清除重置 token 为可选）
    try {
      await db
        .update(users)
        .set({ 
          password_hash: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: new Date()
        })
        .where(eq(users.id, userData.id));
    } catch (e) {
      // 回退仅更新密码哈希
      await db
        .update(users)
        .set({ password_hash: hashedPassword, updated_at: new Date() })
        .where(eq(users.id, userData.id));
      console.warn('Optional column update failed (reset token clear):', e.message);
    }

    return { 
      success: true, 
      message: 'Password reset successfully!',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      }
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Password reset failed' };
  }
}

/**
 * 更改密码（已登录用户）
 */
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    // 获取用户信息
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userData = user[0];

    // 如果有现有密码，验证当前密码
    if (userData.password_hash) {
      const isValid = await verifyPassword(currentPassword, userData.password_hash);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }
    }

    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await db
      .update(users)
      .set({ 
        password_hash: hashedPassword,
        updated_at: new Date()
      })
      .where(eq(users.id, userId));

    return { success: true, message: 'Password updated successfully!' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}