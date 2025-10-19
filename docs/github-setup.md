# GitHub 集成配置指南

## 1. 准备 EverShop 仓库

### 方法一：Fork 现有仓库
```bash
# 1. 访问 EverShop 官方仓库或其他模板
# 2. 点击 Fork 按钮
# 3. 获取你的仓库地址，格式为：your-username/evershop-fly
```

### 方法二：创建新仓库
```bash
# 1. 在 GitHub 创建新仓库，名如：evershop-fly
# 2. 克隆 EverShop 模板代码
git clone https://github.com/evershopcommerce/evershop.git temp-evershop
cd temp-evershop

# 3. 添加你的远程仓库
git remote add origin https://github.com/YOUR_USERNAME/evershop-fly.git
git push -u origin main
```

### 1.2 创建 GitHub Personal Access Token

```bash
# 访问 GitHub Settings
open https://github.com/settings/personal-access-tokens/new
```

**权限设置：**
- Repository access: 选择你的 evershop-fly 仓库
- Permissions:
  - Actions: Read and Write
  - Contents: Read and Write  
  - Metadata: Read
  - Pull requests: Read and Write

**生成后复制 token，格式如：**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. 添加 Workflow 文件

将我们之前创建的 `deploy-new-shop.yml` 复制到你的 EverShop 仓库：

```bash
# 在你的 evershop-fly 仓库中
mkdir -p .github/workflows
# 复制 deploy-new-shop.yml 到 .github/workflows/
```