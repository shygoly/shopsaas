# OAuth 应用配置指南

## Google OAuth 2.0

### 4.1 创建 Google Cloud 项目
```bash
# 1. 访问 Google Cloud Console
open https://console.cloud.google.com

# 2. 创建新项目或选择现有项目
# 3. 项目名称：ShopSaaS (或自定义)
```

### 4.2 启用 Google+ API
```bash
# 1. 在 Google Cloud Console 中
# 2. APIs & Services -> Library
# 3. 搜索 "Google+ API"
# 4. 点击启用
```

### 4.3 配置 OAuth 同意屏幕
```bash
# 1. APIs & Services -> OAuth consent screen
# 2. 选择 "External" 用户类型
# 3. 填写应用信息：
#    - 应用名称: ShopSaaS
#    - 用户支持邮箱: your-email@example.com
#    - 开发者联系信息: your-email@example.com
# 4. 添加作用域: ../auth/userinfo.email, ../auth/userinfo.profile
# 5. 添加测试用户（开发阶段）
```

### 4.4 创建 OAuth 2.0 客户端 ID
```bash
# 1. APIs & Services -> Credentials
# 2. Create Credentials -> OAuth 2.0 Client IDs
# 3. 应用类型: Web application
# 4. 名称: ShopSaaS Web Client
# 5. 授权重定向 URI:
#    - http://localhost:3000/auth/google/callback (开发)
#    - https://shopsaas.fly.dev/auth/google/callback (生产)
```

### 4.5 配置 ShopSaaS
```bash
# 复制 Client ID 和 Client Secret
fly secrets set \
  GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxx" \
  -a shopsaas
```

## GitHub OAuth App

### 4.6 创建 GitHub OAuth App
```bash
# 1. 访问 GitHub Settings
open https://github.com/settings/developers

# 2. OAuth Apps -> New OAuth App
# 3. 填写信息：
#    - Application name: ShopSaaS
#    - Homepage URL: https://shopsaas.fly.dev
#    - Authorization callback URL: https://shopsaas.fly.dev/auth/github/callback
# 4. Register application
```

### 4.7 获取客户端凭据
```bash
# 在 OAuth App 页面：
# 1. 复制 Client ID
# 2. 生成 Client Secret（点击 "Generate a new client secret"）
# 3. 复制 Client Secret
```

### 4.8 配置 ShopSaaS
```bash
fly secrets set \
  GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxxxxxx" \
  GITHUB_CLIENT_SECRET="abcdef1234567890abcdef1234567890abcdef12" \
  -a shopsaas
```

## 验证 OAuth 配置

配置完成后重启应用：
```bash
fly apps restart shopsaas
```

访问 https://shopsaas.fly.dev 测试登录功能：
- Google 登录按钮应该可用
- GitHub 登录按钮应该可用
- 邮箱 Magic Link 登录应该可用

## OAuth 应用配置总结

| 服务 | 客户端 ID 格式 | 客户端密钥格式 |
|------|---------------|---------------|
| Google | `123456789-xxx.apps.googleusercontent.com` | `GOCSPX-xxxxxxxxx` |
| GitHub | `Iv1.xxxxxxxxxxxxxxxx` | `40位十六进制字符串` |

## 注意事项

1. **开发环境**：在本地开发时，需要添加 `localhost:3000` 到授权回调 URL
2. **HTTPS 要求**：生产环境必须使用 HTTPS
3. **域名验证**：某些服务可能需要域名验证
4. **作用域权限**：仅请求必要的用户信息权限
5. **密钥安全**：客户端密钥应通过环境变量管理，不要硬编码