# 邮件服务配置指南

## 选项 1：Resend (推荐)

### 1.1 注册并获取 API Key
```bash
# 1. 访问 Resend
open https://resend.com

# 2. 注册账号并验证邮箱
# 3. 进入 Dashboard -> API Keys
# 4. 创建新的 API Key
# 5. 复制 API key（格式：re_xxxxxxxxx）
```

### 1.2 设置域名（可选）
```bash
# 如有自定义域名，可添加域名验证
# 1. Dashboard -> Domains
# 2. 添加域名并设置 DNS 记录
# 3. 验证域名
```

### 1.3 配置 ShopSaaS
```bash
# 设置 Resend 配置
fly secrets set \
  EMAIL_PROVIDER="resend" \
  RESEND_API_KEY="re_xxxxxxxxx" \
  EMAIL_FROM="noreply@yourdomain.com" \
  -a shopsaas
```

## 选项 2：SendGrid

### 2.1 获取 API Key
```bash
# 1. 访问 SendGrid
open https://sendgrid.com

# 2. 注册账号
# 3. Settings -> API Keys
# 4. 创建 API Key，选择 "Restricted Access"
# 5. 权限：Mail Send - Full Access
```

### 2.2 配置 ShopSaaS
```bash
fly secrets set \
  EMAIL_PROVIDER="sendgrid" \
  SENDGRID_API_KEY="SG.xxxxxxxxx" \
  EMAIL_FROM="noreply@yourdomain.com" \
  -a shopsaas
```

## 选项 3：Gmail SMTP

### 3.1 生成应用密码
```bash
# 1. 启用 2FA（必须）
# 2. 访问 Google Account Settings
open https://myaccount.google.com/security

# 3. 搜索 "App passwords"
# 4. 生成新的应用密码
# 5. 复制 16 位密码（如：abcd efgh ijkl mnop）
```

### 3.2 配置 ShopSaaS
```bash
fly secrets set \
  EMAIL_PROVIDER="smtp" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_SECURE="false" \
  SMTP_USER="your-email@gmail.com" \
  SMTP_PASS="abcd efgh ijkl mnop" \
  EMAIL_FROM="your-email@gmail.com" \
  -a shopsaas
```

## 选项 4：其他 SMTP 服务

### 常见服务商配置

#### Outlook/Hotmail
```bash
fly secrets set \
  EMAIL_PROVIDER="smtp" \
  SMTP_HOST="smtp-mail.outlook.com" \
  SMTP_PORT="587" \
  SMTP_SECURE="false" \
  SMTP_USER="your-email@outlook.com" \
  SMTP_PASS="your-password" \
  EMAIL_FROM="your-email@outlook.com" \
  -a shopsaas
```

#### 阿里云邮箱
```bash
fly secrets set \
  EMAIL_PROVIDER="smtp" \
  SMTP_HOST="smtp.mxhichina.com" \
  SMTP_PORT="465" \
  SMTP_SECURE="true" \
  SMTP_USER="your-email@yourdomain.com" \
  SMTP_PASS="your-password" \
  EMAIL_FROM="your-email@yourdomain.com" \
  -a shopsaas
```

## 测试邮件功能

配置完成后，重启应用并测试：

```bash
# 重启应用
fly apps restart shopsaas

# 测试邮件发送（需要认证）
curl -X POST https://shopsaas.fly.dev/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```