# Hiyori（shopsaas）SaaS 计划（MVP → V1）

## 1) 目标与范围
- 以 Hiyori 作为多租户控制台（SaaS 门户），三种登录：Google、GitHub、邮箱验证/密码。
- 用户在控制台创建店铺 → 由后端触发 GitHub Actions 的 CD 工作流，基于 evershop-fly 在 Fly.io 为其开新店。
- MVP 复用同一 Postgres 与同一 R2（与现有 evershop-fly 一致），以 shop_name、管理员账号区分租户；V1 逐步隔离（独立 DB/R2 或前缀隔离）。

## 2) 架构与组件
- 控制台（Hiyori）：Web 前端 + API，使用自有 Postgres 存用户、租户/店铺元数据、任务记录。
- 认证层：OIDC（Google/GitHub）+ 邮箱验证（Magic Link/OTP）。
- 编排：控制台后端通过 GitHub API 触发 workflow_dispatch（inputs: app_name, shop_name, admin_email, admin_password），轮询状态并回写。
- 配置与密钥：
  - 控制台保管 GitHub Token/APP 凭据、邮件服务 Key；
  - evershop-fly 仓库 Secrets 保管 Fly/DB/R2 共享机密（工作流侧使用）。
- 观测与告警：集中日志、Sentry/Datadog（后续）。

## 3) 认证与账号体系
- 第三方登录：标准 OIDC（Google/GitHub），保存 OAuth 账户映射，首次登录自动创建本地用户。
- 邮箱验证：一次性 Token/Magic Link 或验证码（带有效期与一次性使用标记）。
- 安全基线：速率限制、会话与设备管理、CSRF、防撞库/暴力破解防护。
- 授权模型：平台级（Admin/Support/User）、租户级（店主/协作者），多租户隔离 + RBAC。

## 4) 多租户模型与命名
- 店铺与 Fly App 一一对应：`app_name = evershop-fly-{slug}`。
- 域名：默认 `{app_name}.fly.dev`，V1 支持自定义域（引导 CNAME 与证书）。
- 数据隔离：MVP 共享 DB/R2（按行/前缀隔离）；V1 评估独立 DB 或 R2 bucket/前缀策略。

## 5) 供应链流程（后端编排）
- 校验输入：shop_name、slug、管理员邮箱；检查 slug/app_name 唯一。
- 触发部署：调用 GitHub Actions（deploy-new-shop.yml）传入必要 inputs。
- 敏感信息安全：
  - 方案A（推荐）：控制台先用 Fly API 为目标 app 设置 ADMIN_EMAIL/ADMIN_PASSWORD secrets，workflow 仅在容器内读取；
  - 方案B：临时 repo environment secret（运行后清理）。
- 状态回传：轮询 Actions + Fly 健康检查；写入“店铺创建状态”。
- 并发与配额：队列化（BullMQ 等）、失败指数退避与重试、限额控制。

## 6) 工作流对接（CD 增强点）
- 共享 Secrets：继续使用仓库 Secrets（DATABASE_URL、AWS_*、PUBLIC_ASSET_BASE_URL、FLY_API_TOKEN）。
- 差异化配置：`NODE_CONFIG` 覆盖 `shop.name`；管理员在容器内通过 env 读取创建（避免泄露）。
- 健康验证：部署后检查 `/` 或 Fly checks 通过再创建管理员；失败回滚或标记失败。
- 回调：工作流尾部可回调控制台 API（可选，提升实时性）。

## 7) 控制台后端 API 设计
- POST `/api/shops`：创建店铺（鉴权），请求体含 `shop_name`（可选 `admin_email/password`）。
- GET `/api/shops/{id}/status`：查询进度与最终 URL。
- 幂等与审计：slug 幂等键、任务审计日志、操作日志。

## 8) 邮件与通知
- 邮件服务（Resend/SES/SendGrid）：
  - 邮箱登录验证（Magic Link/OTP）；
  - 店铺创建完成通知（含后台链接、初始账号、强制改密链接）。
- 模板国际化与品牌化、退订/频率限制。

## 9) 计费与配额（V1）
- Stripe 订阅：按店铺数量/资源配额计费；Webhook 同步订阅状态（限制创建/暂停访问）。
- 成本管控：机器规格、自动休眠、图像任务限流；提供试用店铺。

## 10) 监控与运维
- Fly：日志/健康检查、机器数量/资源告警、配额监控。
- 控制台：Sentry/Prometheus 指标、任务失败与邮件退信监控。
- 审计：用户/管理员关键操作留痕。

## 11) 路线图
- MVP（1–2 周）
  - 三种登录、店铺创建页与队列任务；
  - 对接现有 CD 工作流（安全传参）；
  - 成功/失败回传、基础审计。
- V1（+2–3 周）
  - 自定义域、配额/限流、基础计费与邮件模板；
  - 店铺生命周期管理（重建、销毁、扩容）；
  - 更强隔离（独立 DB/前缀策略）。
- V2（+4 周）
  - 主题/配置下发、插件市场；
  - 观测/报表、团队协作与角色；
  - 备份/恢复、跨区容灾。

## 12) 风险与对策
- 密钥泄露：不在 GH Logs 打印敏感信息；容器内读取环境变量；最小权限 GitHub App。
- 共享 DB/R2 的租户边界：应用/数据层双重校验，后续迁移到强隔离。
- 供应失败回滚：超时与失败自动清理 app，幂等重试与人工兜底工具。
