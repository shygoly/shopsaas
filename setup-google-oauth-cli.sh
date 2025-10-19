#!/bin/bash

echo "🤖 全自动 Google OAuth 配置 (使用 gcloud API)"
echo "=============================================="

# 设置 gcloud 路径
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

echo ""
echo "📋 步骤 1: 认证 Google Cloud"
echo "============================"

# 检查是否已经登录
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1; then
    echo "需要先登录 Google Cloud..."
    gcloud auth login --brief
    
    if [ $? -ne 0 ]; then
        echo "❌ 认证失败，请检查网络连接并重试"
        exit 1
    fi
fi

CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo "✅ 当前登录用户: $CURRENT_USER"

echo ""
echo "📋 步骤 2: 创建项目"
echo "=================="

PROJECT_ID="shopsaas-$(date +%s)"
echo "创建项目: $PROJECT_ID"

gcloud projects create $PROJECT_ID --name="ShopSaaS OAuth Project" --quiet

if [ $? -eq 0 ]; then
    echo "✅ 项目创建成功！"
else
    echo "❌ 项目创建失败，尝试使用现有项目..."
    echo "现有项目："
    gcloud projects list --format="table(projectId,name)" --limit=5
    read -p "请输入要使用的项目 ID: " PROJECT_ID
fi

# 设置默认项目
gcloud config set project $PROJECT_ID --quiet
echo "✅ 设置默认项目: $PROJECT_ID"

echo ""
echo "📋 步骤 3: 启用 API"
echo "=================="

echo "启用必要的 API..."
gcloud services enable iamcredentials.googleapis.com --quiet
gcloud services enable cloudresourcemanager.googleapis.com --quiet
gcloud services enable serviceusage.googleapis.com --quiet

echo "✅ API 启用完成"

echo ""
echo "📋 步骤 4: 尝试通过 API 创建 OAuth 客户端"
echo "========================================"

# 获取项目编号
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "项目编号: $PROJECT_NUMBER"

echo ""
echo "🔧 由于 OAuth 客户端创建需要复杂的 API 调用，"
echo "我将打开 Google Cloud Console 供您快速配置："
echo ""

# 自动打开相关页面
echo "正在打开 OAuth 同意屏幕配置页面..."
open "https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"

echo ""
echo "⏳ 请在浏览器中完成以下步骤："
echo ""
echo "1. 🔧 OAuth 同意屏幕配置:"
echo "   - 用户类型: External"
echo "   - 应用名称: ShopSaaS"
echo "   - 用户支持邮箱: $CURRENT_USER"
echo "   - 开发者联系邮箱: $CURRENT_USER"
echo "   - 作用域: ../auth/userinfo.email, ../auth/userinfo.profile"
echo ""

read -p "OAuth 同意屏幕配置完成后，按回车继续..."

echo ""
echo "正在打开 OAuth 客户端创建页面..."
open "https://console.cloud.google.com/apis/credentials/oauthclient/new?project=$PROJECT_ID"

echo ""
echo "2. 🔧 OAuth 2.0 客户端 ID 配置:"
echo "   - 应用类型: Web 应用"
echo "   - 名称: ShopSaaS Web Client"
echo "   - 授权的重定向 URI:"
echo "     • https://shopsaas.fly.dev/auth/google/callback"
echo "     • http://localhost:3000/auth/google/callback"
echo ""

read -p "OAuth 客户端创建完成后，按回车继续..."

echo ""
echo "📋 步骤 5: 配置 ShopSaaS 应用"
echo "============================"

echo "请从 Google Cloud Console 复制您的凭据:"
echo ""
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET

if [[ -z "$GOOGLE_CLIENT_ID" || -z "$GOOGLE_CLIENT_SECRET" ]]; then
    echo "❌ 凭据不能为空，请重新运行脚本"
    exit 1
fi

echo ""
echo "🚀 正在配置 Fly.io 应用..."

fly secrets set \
    GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
    -a shopsaas

if [ $? -eq 0 ]; then
    echo "✅ Fly.io 密钥配置成功！"
    
    echo ""
    echo "🧪 测试配置..."
    echo "等待应用重启..."
    sleep 15
    
    # 测试健康检查
    if curl -s https://shopsaas.fly.dev/health | grep -q '"ok":true'; then
        echo "✅ 应用运行正常"
        
        echo ""
        echo "🎉 Google OAuth 配置完成！"
        echo ""
        echo "📋 测试步骤:"
        echo "1. 访问: https://shopsaas.fly.dev/"
        echo "2. 点击 'Continue with Google' 按钮"
        echo "3. 使用 Google 账户登录"
        echo ""
        echo "📊 监控和调试:"
        echo "- 应用日志: fly logs -a shopsaas"
        echo "- Google 日志: fly logs -a shopsaas | grep -i google"
        echo "- 项目控制台: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
        
    else
        echo "⚠️  应用可能还在重启，请稍后手动测试"
    fi
    
else
    echo "❌ Fly.io 密钥配置失败"
    exit 1
fi

echo ""
echo "📋 配置摘要"
echo "==========="
echo "✅ Google Cloud 项目: $PROJECT_ID"
echo "✅ OAuth 客户端: 已创建"
echo "✅ Fly.io 密钥: 已配置"
echo "✅ 应用地址: https://shopsaas.fly.dev/"
echo ""
echo "🔗 有用的链接:"
echo "- 项目仪表板: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo "- OAuth 凭据管理: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "- OAuth 同意屏幕: https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo ""
echo "🎊 自动化配置完成！现在可以使用 Google 登录了！"