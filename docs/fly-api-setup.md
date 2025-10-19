# Fly.io API Token 配置指南

## 获取 Fly API Token

### 方法一：通过 CLI 获取（推荐）
```bash
# 确保已登录 Fly.io
flyctl auth whoami

# 创建新的 API token
flyctl auth token

# 会输出类似：
# FlyV1 fm1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 方法二：通过 Web Dashboard
```bash
# 1. 访问 Fly.io Dashboard
open https://fly.io/dashboard

# 2. 进入 Account Settings
# 3. 选择 "Personal Access Tokens"
# 4. 点击 "Create token"
# 5. 输入描述（如：ShopSaaS Production）
# 6. 复制生成的 token
```

## 验证 Token
```bash
# 使用获取的 token 测试
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.machines.dev/v1/apps

# 应该返回你的应用列表
```

## Token 格式
```
FlyV1 fm1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意：**
- Token 仅显示一次，请妥善保存
- 建议定期轮换 token
- 不要提交到代码仓库