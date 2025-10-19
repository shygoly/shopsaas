import nodemailer from 'nodemailer';
import { db } from '../db/index.js';
import { email_tokens, users } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Email transporter configuration
const createTransporter = () => {
  if (process.env.EMAIL_PROVIDER === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Default to console for development
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
};

const transporter = createTransporter();

// Generate and send magic link for email login
export async function sendMagicLink(email, type = 'login') {
  try {
    // Clean up expired tokens
    await db.delete(email_tokens)
      .where(and(
        eq(email_tokens.email, email),
        eq(email_tokens.token_type, type),
        gt(new Date(), email_tokens.expires_at)
      ));

    // Generate new token
    const token = uuidv4();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(email_tokens).values({
      email,
      token,
      token_type: type,
      expires_at,
    });

    // Generate magic link
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Email content
    const subject = type === 'login' ? 'Sign in to ShopSaaS' : 'Verify your email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ShopSaaS</h2>
        <p>Click the link below to ${type === 'login' ? 'sign in' : 'verify your email'}:</p>
        <a href="${magicLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          ${type === 'login' ? 'Sign In' : 'Verify Email'}
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This link will expire in 15 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@shopsaas.com',
      to: email,
      subject,
      html,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Magic Link:', magicLink);
      console.log('Email would be sent to:', email);
    } else {
      await transporter.sendMail(mailOptions);
    }

    return { success: true, token };
  } catch (error) {
    console.error('Failed to send magic link:', error);
    throw new Error('Failed to send email');
  }
}

// Verify magic link token
export async function verifyEmailToken(token) {
  try {
    const tokenRecord = await db
      .select()
      .from(email_tokens)
      .where(and(
        eq(email_tokens.token, token),
        eq(email_tokens.used, false),
        gt(email_tokens.expires_at, new Date())
      ))
      .limit(1);

    if (tokenRecord.length === 0) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const record = tokenRecord[0];

    // Mark token as used
    await db.update(email_tokens)
      .set({ used: true })
      .where(eq(email_tokens.id, record.id));

    // Find or create user
    let user = await db.select().from(users).where(eq(users.email, record.email)).limit(1);
    
    if (user.length === 0 && record.token_type === 'login') {
      // Create new user for login
      const newUser = await db.insert(users).values({
        email: record.email,
        email_verified: true,
      }).returning();
      user = newUser;
    } else if (user.length > 0 && record.token_type === 'verification') {
      // Verify existing user's email
      await db.update(users)
        .set({ email_verified: true })
        .where(eq(users.id, user[0].id));
      user[0].email_verified = true;
    }

    return {
      success: true,
      user: user[0],
      token_type: record.token_type
    };
  } catch (error) {
    console.error('Failed to verify email token:', error);
    return { success: false, error: 'Verification failed' };
  }
}

// Send shop creation notification
export async function sendShopCreatedNotification(userEmail, shopName, shopUrl, adminCredentials) {
  try {
    const subject = `Your shop "${shopName}" is ready!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Your Shop is Ready!</h2>
        <p>Great news! Your shop "<strong>${shopName}</strong>" has been successfully created and deployed.</p>
        
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3>Shop Details:</h3>
          <p><strong>Shop URL:</strong> <a href="${shopUrl}">${shopUrl}</a></p>
          <p><strong>Admin Email:</strong> ${adminCredentials.email}</p>
          <p><strong>Admin Password:</strong> ${adminCredentials.password}</p>
        </div>
        
        <p style="color: #dc3545; font-weight: bold;">
          ⚠️ Important: Please change your admin password immediately after first login for security.
        </p>
        
        <a href="${shopUrl}/admin" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
          Access Admin Panel
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Thank you for choosing ShopSaaS! If you have any questions, please don't hesitate to contact our support team.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@shopsaas.com',
      to: userEmail,
      subject,
      html,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Shop notification would be sent to:', userEmail);
      console.log('Shop URL:', shopUrl);
    } else {
      await transporter.sendMail(mailOptions);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send shop notification:', error);
    throw new Error('Failed to send notification');
  }
}