import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { db } from '../db/index.js';
import { users, oauth_accounts } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    done(null, user[0] || null);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || ''}/auth/google/callback`,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if OAuth account exists
      const existingOAuth = await db
        .select()
        .from(oauth_accounts)
        .where(and(
          eq(oauth_accounts.provider, 'google'),
          eq(oauth_accounts.provider_id, profile.id)
        ))
        .limit(1);

      if (existingOAuth.length > 0) {
        // Get associated user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, existingOAuth[0].user_id))
          .limit(1);
        return done(null, user[0]);
      }

      // Check if user exists by email
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by Google'), null);
      }

      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0) {
        // Create new user
        const newUser = await db.insert(users).values({
          email,
          name: profile.displayName,
          avatar_url: profile.photos?.[0]?.value,
          email_verified: true, // Google accounts are pre-verified
          credits: 0,
          first_shop_redeemed: false,
        }).returning();
        user = newUser;
      }

      // Link OAuth account
      await db.insert(oauth_accounts).values({
        user_id: user[0].id,
        provider: 'google',
        provider_id: profile.id,
        provider_data: {
          access_token: accessToken,
          profile: profile._json
        }
      });

      done(null, user[0]);
    } catch (error) {
      done(error, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL || ''}/auth/github/callback`,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if OAuth account exists
      const existingOAuth = await db
        .select()
        .from(oauth_accounts)
        .where(and(
          eq(oauth_accounts.provider, 'github'),
          eq(oauth_accounts.provider_id, profile.id)
        ))
        .limit(1);

      if (existingOAuth.length > 0) {
        // Get associated user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, existingOAuth[0].user_id))
          .limit(1);
        return done(null, user[0]);
      }

      // Check if user exists by email
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by GitHub'), null);
      }

      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0) {
        // Create new user
        const newUser = await db.insert(users).values({
          email,
          name: profile.displayName || profile.username,
          avatar_url: profile.photos?.[0]?.value,
          email_verified: true, // GitHub accounts are pre-verified
          credits: 0,
          first_shop_redeemed: false,
        }).returning();
        user = newUser;
      }

      // Link OAuth account
      await db.insert(oauth_accounts).values({
        user_id: user[0].id,
        provider: 'github',
        provider_id: profile.id,
        provider_data: {
          access_token: accessToken,
          profile: profile._json
        }
      });

      done(null, user[0]);
    } catch (error) {
      done(error, null);
    }
  }));
}

export default passport;