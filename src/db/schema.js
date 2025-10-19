import { pgTable, serial, varchar, text, timestamp, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }), // null for OAuth users
  name: varchar('name', { length: 255 }),
  avatar_url: text('avatar_url'),
  email_verified: boolean('email_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// OAuth 账户表
export const oauth_accounts = pgTable('oauth_accounts', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // 'google', 'github'
  provider_id: varchar('provider_id', { length: 255 }).notNull(),
  provider_data: jsonb('provider_data'), // store additional OAuth data
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  provider_idx: index('oauth_provider_idx').on(table.provider, table.provider_id),
}));

// 邮箱验证 token 表
export const email_tokens = pgTable('email_tokens', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: uuid('token').defaultRandom().notNull(),
  token_type: varchar('token_type', { length: 50 }).notNull(), // 'login', 'verification'
  expires_at: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  token_idx: index('email_token_idx').on(table.token),
  email_type_idx: index('email_type_idx').on(table.email, table.token_type),
}));

// 店铺表
export const shops = pgTable('shops', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id, { onDelete: 'cascade' }),
  shop_name: varchar('shop_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  app_name: varchar('app_name', { length: 100 }).unique().notNull(), // evershop-fly-{slug}
  domain: varchar('domain', { length: 255 }), // custom domain
  status: varchar('status', { length: 50 }).default('creating'), // creating, active, failed, suspended
  admin_email: varchar('admin_email', { length: 255 }).notNull(),
  config: jsonb('config'), // shop-specific configuration
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  user_idx: index('shop_user_idx').on(table.user_id),
  status_idx: index('shop_status_idx').on(table.status),
}));

// 任务/部署记录表
export const deployments = pgTable('deployments', {
  id: serial('id').primaryKey(),
  shop_id: serial('shop_id').references(() => shops.id, { onDelete: 'cascade' }),
  github_run_id: varchar('github_run_id', { length: 100 }),
  status: varchar('status', { length: 50 }).default('queued'), // queued, running, success, failed
  logs: text('logs'),
  error_message: text('error_message'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  shop_idx: index('deployment_shop_idx').on(table.shop_id),
  status_idx: index('deployment_status_idx').on(table.status),
  run_id_idx: index('deployment_run_id_idx').on(table.github_run_id),
}));

// 审计日志表
export const audit_logs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(), // 'shop_created', 'login', etc.
  resource_type: varchar('resource_type', { length: 50 }), // 'shop', 'user', etc.
  resource_id: varchar('resource_id', { length: 100 }),
  details: jsonb('details'), // additional context
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  user_idx: index('audit_user_idx').on(table.user_id),
  action_idx: index('audit_action_idx').on(table.action),
  created_idx: index('audit_created_idx').on(table.created_at),
}));