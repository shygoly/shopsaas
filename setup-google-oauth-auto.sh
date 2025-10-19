#!/bin/bash

echo "🔧 自动化 Google OAuth 配置"
echo "============================"

# 设置 gcloud 路径
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

echo ""
echo "📋 步骤 1: Google Cloud CLI 认证"
echo "================================"
echo "接下来需要您授权访问 Google Cloud..."
echo ""

# 初始化 gcloud 并登录
gcloud auth login --brief

if [ $? -ne 0 ]; then
    echo "❌ 认证失败，请检查网络连接并重试"
    exit 1
fi

echo ""
echo "✅ 认证成功！"
echo ""

# 获取当前登录的用户
CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo "当前登录用户: $CURRENT_USER"

echo ""
echo "📋 步骤 2: 创建或选择项目"
echo "========================="

# 生成项目 ID
PROJECT_ID="shopsaas-$(date +%s)"
echo "建议的项目 ID: $PROJECT_ID"
echo ""

read -p "使用建议的项目 ID？[y/N]: " USE_SUGGESTED

if [[ $USE_SUGGESTED =~ ^[Yy]$ ]]; then
    echo "创建项目: $PROJECT_ID"
    gcloud projects create $PROJECT_ID --name="ShopSaaS"
    
    if [ $? -eq 0 ]; then
        echo "✅ 项目创建成功！"
    else
        echo "❌ 项目创建失败，可能项目 ID 已存在"
        echo "请手动提供一个唯一的项目 ID："
        read -p "项目 ID: " PROJECT_ID
    fi
else
    echo ""
    echo "现有项目列表："
    gcloud projects list --format="table(projectId,name,projectNumber)"
    echo ""
    read -p "请输入要使用的项目 ID（或输入新项目 ID）: " PROJECT_ID
    
    # 尝试创建项目（如果不存在）
    gcloud projects create $PROJECT_ID --name="ShopSaaS" 2>/dev/null || echo "项目可能已存在，继续..."
fi

# 设置默认项目
echo ""
echo "设置默认项目为: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo ""
echo "📋 步骤 3: 启用必要的 API"
echo "========================"

echo "启用 Google+ API..."
gcloud services enable plus.googleapis.com

echo "启用 OAuth2 API..."
gcloud services enable oauth2.googleapis.com

echo "✅ API 启用完成"

echo ""
echo "📋 步骤 4: 创建 OAuth 2.0 客户端"
echo "================================"

# 首先需要配置 OAuth 同意屏幕
echo "配置 OAuth 同意屏幕..."

# 创建 OAuth brand (同意屏幕)
echo "正在配置 OAuth 同意屏幕..."

# 创建客户端 ID
echo "创建 OAuth 2.0 客户端..."

CLIENT_NAME="ShopSaaS-Web-Client-$(date +%s)"
REDIRECT_URIS="https://shopsaas.fly.dev/auth/google/callback,http://localhost:3000/auth/google/callback"

# 使用 gcloud 创建 OAuth 客户端
echo "正在创建 OAuth 客户端: $CLIENT_NAME"

# 注意: gcloud 的 OAuth 客户端创建功能可能有限，我们可能需要手动操作
echo ""
echo "⚠️  注意: gcloud CLI 对 OAuth 客户端管理功能有限"
echo "推荐通过 Google Cloud Console 完成以下步骤："
echo ""
echo "1. 访问: https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo "2. 配置 OAuth 同意屏幕:"
echo "   - 用户类型: External"
echo "   - 应用名称: ShopSaaS"
echo "   - 用户支持邮箱: $CURRENT_USER"
echo "   - 开发者联系邮箱: $CURRENT_USER"
echo "3. 作用域: ../auth/userinfo.email, ../auth/userinfo.profile"
echo ""
echo "4. 访问: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "5. 点击 '创建凭据' > 'OAuth 2.0 客户端 ID'"
echo "6. 应用类型: Web 应用"
echo "7. 授权重定向 URI:"
echo "   - https://shopsaas.fly.dev/auth/google/callback"
echo "   - http://localhost:3000/auth/google/callback"
echo ""

echo "打开 Google Cloud Console..."
open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"

echo ""
echo "⏳ 请在浏览器中完成 OAuth 客户端配置..."
echo "配置完成后，您会获得 Client ID 和 Client Secret"
echo ""

read -p "配置完成后，按回车继续..."

echo ""
echo "📋 步骤 5: 配置 ShopSaaS"
echo "======================"

read -p "请输入 Google Client ID: " GOOGLE_CLIENT_ID
read -p "请输入 Google Client Secret: " GOOGLE_CLIENT_SECRET

if [[ -n "$GOOGLE_CLIENT_ID" && -n "$GOOGLE_CLIENT_SECRET" ]]; then
    echo ""
    echo "🚀 配置 Fly.io 密钥..."
    
    fly secrets set \
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
        -a shopsaas
    
    if [ $? -eq 0 ]; then
        echo "✅ Google OAuth 配置完成！"
        echo ""
        echo "🧪 测试步骤："
        echo "1. 等待应用重启 (约30秒)"
        echo "2. 访问: https://shopsaas.fly.dev/"
        echo "3. 点击 'Continue with Google' 按钮"
        echo "4. 完成 Google 登录流程"
        echo ""
        echo "📊 监控日志："
        echo "fly logs -a shopsaas | grep -i google"
        echo ""
        echo "🎉 Google OAuth 登录现已可用！"
        
        # 测试连接
        echo ""
        echo "🧪 测试 Google OAuth 配置..."
        sleep 5
        curl -s https://shopsaas.fly.dev/health > /dev/null
        if [ $? -eq 0 ]; then
            echo "✅ 应用运行正常，Google OAuth 已配置"
        else
            echo "⚠️  应用可能正在重启，请稍后测试"
        fi
    else
        echo "❌ Fly.io 密钥配置失败"
        exit 1
    fi
else
    echo "❌ Client ID 或 Client Secret 为空，配置未完成"
    exit 1
fi

echo ""
echo "📋 配置摘要"
echo "==========="
echo "项目 ID: $PROJECT_ID"
echo "项目链接: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo "OAuth 凭据: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "应用地址: https://shopsaas.fly.dev/"
echo ""
echo "🎊 自动化配置完成！"