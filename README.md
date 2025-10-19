# ShopSaaS

🚀 **Multi-tenant EverShop deployment platform on Fly.io**

ShopSaaS 是一个多租户 SaaS 平台，允许用户通过简单的 Web 界面快速创建和部署独立的 EverShop 电商店铺。每个店铺运行在独立的 Fly.io 应用实例上，实现完全的资源隔离和可扩展性。

## ✨ 核心特性

- 🔐 **多种认证方式**: Google OAuth, GitHub OAuth, 邮箱 Magic Link
- 🏪 **一键店铺创建**: 通过 Web 界面快速创建 EverShop 实例  
- 🚀 **自动化部署**: GitHub Actions + Fly.io 无缝集成
- 📊 **实时监控**: 队列状态、部署进度、健康检查
- 📧 **邮件通知**: 店铺创建完成通知
- 🔍 **审计日志**: 完整的操作记录和追踪
- ⚡ **队列处理**: BullMQ + Redis 可靠的异步任务处理
- 🔒 **安全管理**: Fly Secrets 安全凭据管理

## 🏗️ 技术架构

```
[用户] → [Fly Load Balancer] → [ShopSaaS App]
                                      ↓
                              [BullMQ + Redis]
                                      ↓
                              [GitHub Actions] → [EverShop Apps]
                                      ↓
                              [共享 PostgreSQL]
```

### 技术栈
- **前端**: Vanilla HTML/CSS/JavaScript (SPA)
- **后端**: Node.js + Express.js
- **数据库**: PostgreSQL (Drizzle ORM)
- **队列**: BullMQ + Redis
- **认证**: Passport.js (OAuth + Magic Link)
- **部署**: Fly.io + GitHub Actions
- **邮件**: Nodemailer (支持多种服务商)

## 🚀 部署状态

**✅ 已完成生产部署！**

- **主应用**: https://shopsaas.fly.dev/ 🔗
- **Redis 服务**: 内部网络 `fdaa:29:c944:0:1::7`
- **GitHub 集成**: `shygoly/evershop-fly` 仓库就绪
- **队列系统**: BullMQ + Redis 运行正常

## 🔧 配置完成清单

### ✅ 已配置项目
- [x] GitHub 仓库和 API 集成
- [x] Fly.io 应用部署
- [x] Redis 队列服务
- [x] 数据库连接
- [x] 安全密钥管理
- [x] 健康检查和监控

### 📋 API 端点

#### 认证相关
- `POST /auth/email` - 发送 Magic Link
- `GET /auth/email/verify/:token` - 验证邮箱登录
- `GET /auth/google` - Google OAuth 登录
- `GET /auth/github` - GitHub OAuth 登录
- `POST /auth/logout` - 退出登录

#### 店铺管理
- `GET /api/shops` - 获取用户店铺列表
- `POST /api/shops` - 创建新店铺
- `GET /api/shops/:id/status` - 获取店铺状态
- `GET /api/deployments/:id/status` - 获取部署状态

#### 系统管理
- `GET /api/system/status` - 系统状态 (需认证)
- `GET /health` - 健康检查

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/shygoly/shopsaas.git
cd shopsaas
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件设置必要的配置
```

4. **启动开发服务器**
```bash
npm run dev
```

### 生产部署

参考 [DEPLOYMENT.md](docs/DEPLOYMENT.md) 获取完整部署指南。

## 📝 环境变量配置

### 必需配置

| 环境变量 | 描述 | 示例值 |
|----------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgres://...` |
| `SESSION_SECRET` | 会话加密密钥 | `随机字符串` |
| `GH_REPO` | GitHub 仓库 | `username/evershop-fly` |
| `GITHUB_TOKEN` | GitHub API 令牌 | `gho_...` |
| `FLY_API_TOKEN` | Fly.io API 令牌 | `fm2_...` |

### 可选配置

#### 邮件服务
```bash
# Resend (推荐)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...

# Gmail SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
```

#### OAuth 登录
```bash
# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1....
GITHUB_CLIENT_SECRET=...
```

## 📊 监控和日志

### 应用监控
- **主应用**: https://fly.io/apps/shopsaas/monitoring
- **Redis 服务**: https://fly.io/apps/shopsaas-redis/monitoring

### 日志查看
```bash
# 查看应用日志
fly logs -a shopsaas

# 查看 Redis 日志
fly logs -a shopsaas-redis
```

## 🧪 系统验证

运行验证脚本检查系统状态：

```bash
./verify-deployment.sh
```

## 📚 文档

- [部署指南](docs/DEPLOYMENT.md)
- [GitHub 配置](docs/github-setup.md)
- [Fly.io API 配置](docs/fly-api-setup.md)
- [邮件服务配置](docs/email-setup.md)
- [OAuth 配置](docs/oauth-setup.md)

## 🔒 安全考虑

- 所有敏感信息通过 Fly Secrets 管理
- 会话采用安全的 cookie 设置
- API 端点实施认证和授权检查
- 队列任务支持重试和死信队列
- 审计日志记录关键操作

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [EverShop](https://evershop.io/) - 开源电商平台
- [Fly.io](https://fly.io/) - 云部署平台
- [BullMQ](https://bullmq.io/) - 队列处理系统

## 📞 支持

- 🐛 [报告 Bug](https://github.com/shygoly/shopsaas/issues)
- 💡 [功能建议](https://github.com/shygoly/shopsaas/issues)
- 📧 邮箱: support@shopsaas.dev

---

**让创建电商店铺变得简单快捷！** 🛍️✨
