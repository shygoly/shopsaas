# R2 存储配置状态报告

## 当前状态

### ❌ R2 存储未完全配置

**检查结果**:
- ✅ EverShop 配置文件已启用 S3 存储
- ❌ GitHub Secrets 缺少 R2/AWS 环境变量
- ❌ 店铺实例缺少 S3 认证信息

### 配置文件检查

**文件**: `evershop-fly/config/production.json`
```json
{
  "system": {
    "file_storage": "s3",
    "extensions": [
      {
        "name": "s3_file_storage",
        "resolve": "node_modules/@evershop/s3_file_storage",
        "enabled": true,
        "priority": 10
      }
    ]
  }
}
```
✅ 配置正确，已启用 S3 存储

### GitHub Secrets 检查

**仓库**: `shygoly/evershop-fly`

**当前 Secrets**:
- ✅ DATABASE_URL
- ✅ DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- ✅ FLY_API_TOKEN, FLYCTL_ACCESS_TOKEN, FLY_ACCESS_TOKEN
- ✅ FLY_ORG_SLUG

**缺少的 Secrets**:
- ❌ AWS_ACCESS_KEY_ID
- ❌ AWS_SECRET_ACCESS_KEY
- ❌ AWS_REGION
- ❌ AWS_BUCKET_NAME
- ❌ AWS_ENDPOINT_URL_S3
- ❌ PUBLIC_ASSET_BASE_URL

### 店铺实例检查

**店铺**: Debug Test Shop 2025
**URL**: https://evershop-fly-debug-test-shop-2025.fly.dev

**环境变量**:
```
ADMIN_EMAIL: ✅ 已配置
ADMIN_PASSWORD: ✅ 已配置
DATABASE_URL: ✅ 已配置
NODE_CONFIG: ✅ 已配置
DB_*: ✅ 已配置

AWS_*: ❌ 缺失
R2_*: ❌ 缺失
```

---

## 配置 R2 存储步骤

### 步骤 1: 创建 Cloudflare R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage
3. 创建新的 bucket: `evershop-media` (或其他名称)
4. 生成 API Token:
   - 点击 "Manage R2 API Tokens"
   - 创建新 token，选择 "Read & Write" 权限
   - 记录:
     - Access Key ID
     - Secret Access Key
     - Account ID
5. 获取 Endpoint URL: `https://<account_id>.r2.cloudflarestorage.com`

### 步骤 2: 配置 GitHub Repository Secrets

在 `shygoly/evershop-fly` 仓库中添加以下 secrets:

```bash
# 方法 1: 通过 GitHub Web UI
Settings → Secrets and variables → Actions → New repository secret

# 方法 2: 通过 GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --repo shygoly/evershop-fly
gh secret set AWS_SECRET_ACCESS_KEY --repo shygoly/evershop-fly
gh secret set AWS_REGION --body "auto" --repo shygoly/evershop-fly
gh secret set AWS_BUCKET_NAME --body "evershop-media" --repo shygoly/evershop-fly
gh secret set AWS_ENDPOINT_URL_S3 --body "https://<account_id>.r2.cloudflarestorage.com" --repo shygoly/evershop-fly
gh secret set PUBLIC_ASSET_BASE_URL --body "https://<account_id>.r2.cloudflarestorage.com/evershop-media" --repo shygoly/evershop-fly
```

### 步骤 3: 重新部署现有店铺（可选）

如果要为现有店铺添加 R2 存储:

```bash
# 手动设置单个店铺的 secrets
fly secrets set \
  AWS_ACCESS_KEY_ID="your_r2_access_key_id" \
  AWS_SECRET_ACCESS_KEY="your_r2_secret_access_key" \
  AWS_REGION="auto" \
  AWS_BUCKET_NAME="evershop-media" \
  AWS_ENDPOINT_URL_S3="https://<account_id>.r2.cloudflarestorage.com" \
  PUBLIC_ASSET_BASE_URL="https://<account_id>.r2.cloudflarestorage.com/evershop-media" \
  -a evershop-fly-debug-test-shop-2025

# 然后重启应用
fly apps restart evershop-fly-debug-test-shop-2025
```

### 步骤 4: 创建新店铺测试

配置好 GitHub secrets 后，新创建的店铺将自动继承这些配置。

---

## 验证 R2 存储是否工作

### 方法 1: 上传产品图片

1. 登录管理后台: https://evershop-fly-debug-test-shop-2025.fly.dev/admin
2. 创建或编辑产品
3. 上传产品图片
4. 检查图片 URL 是否指向 R2 bucket

### 方法 2: 检查日志

```bash
fly logs -a evershop-fly-debug-test-shop-2025 | grep -i "s3\|upload\|storage"
```

成功的标志:
```
✅ S3 storage initialized
✅ File uploaded to s3://evershop-media/...
```

失败的标志:
```
❌ S3 upload failed: Missing credentials
❌ AccessDenied
❌ InvalidAccessKeyId
```

### 方法 3: 检查环境变量

```bash
fly ssh console -a evershop-fly-debug-test-shop-2025 -C "printenv | grep AWS"
```

应该看到:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=auto
AWS_BUCKET_NAME=evershop-media
AWS_ENDPOINT_URL_S3=https://...r2.cloudflarestorage.com
```

---

## 当前影响

### 功能影响

| 功能 | 状态 | 说明 |
|------|------|------|
| 产品图片上传 | ⚠️ 受限 | 可能使用本地存储或失败 |
| 媒体文件管理 | ⚠️ 受限 | 无法持久化存储 |
| 图片访问 | ⚠️ 受限 | 重启后可能丢失 |
| 其他功能 | ✅ 正常 | 不依赖文件存储的功能正常 |

### 为什么需要 R2

1. **持久化存储**: Fly.io 容器是临时的，重启后本地文件会丢失
2. **跨实例共享**: 多个 machine 实例需要共享媒体文件
3. **性能优化**: CDN 加速图片加载
4. **成本效益**: R2 免费出站流量

---

## 推荐行动

### 优先级 1: 配置 GitHub Secrets (高优先级)

这样所有**新创建的店铺**都会自动配置 R2 存储。

```bash
# 使用 GitHub CLI 快速配置
gh secret set AWS_ACCESS_KEY_ID --repo shygoly/evershop-fly
# 输入: R2 Access Key ID

gh secret set AWS_SECRET_ACCESS_KEY --repo shygoly/evershop-fly
# 输入: R2 Secret Access Key

gh secret set AWS_REGION --body "auto" --repo shygoly/evershop-fly
gh secret set AWS_BUCKET_NAME --body "evershop-media" --repo shygoly/evershop-fly

gh secret set AWS_ENDPOINT_URL_S3 --repo shygoly/evershop-fly
# 输入: https://<account_id>.r2.cloudflarestorage.com

gh secret set PUBLIC_ASSET_BASE_URL --repo shygoly/evershop-fly
# 输入: https://<account_id>.r2.cloudflarestorage.com/evershop-media
```

### 优先级 2: 更新现有店铺 (中优先级)

为已部署的店铺手动添加 R2 配置。

---

## 总结

**当前状态**: ⚠️ S3 存储已启用但未配置认证

**需要操作**:
1. 创建 Cloudflare R2 bucket
2. 配置 GitHub repository secrets
3. 重新创建店铺或手动更新现有店铺

**预计时间**: 10-15 分钟

**详细文档**: 参考 `S3_STORAGE_SETUP.md`

---

**报告生成时间**: 2025-10-30  
**检查的店铺**: evershop-fly-debug-test-shop-2025

