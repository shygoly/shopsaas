#!/bin/bash

echo "🔧 Google OAuth 快速配置向导"
echo "================================"

echo ""
echo "📋 步骤 1: 创建 Google Cloud 项目"
echo "1. 访问: https://console.cloud.google.com/projectcreate"
echo "2. 项目名称: ShopSaaS"
echo "3. 点击 '创建'"
echo ""
read -p "项目创建完成后，按回车继续..."

echo ""
echo "📋 步骤 2: 启用必要的 API"
echo "1. 在项目中搜索 'Google+ API' 并启用"
echo "2. 或直接访问: https://console.cloud.google.com/apis/library/plus.googleapis.com"
echo ""
read -p "API 启用完成后，按回车继续..."

echo ""
echo "📋 步骤 3: 配置 OAuth 同意屏幕"
echo "1. 访问: https://console.cloud.google.com/apis/credentials/consent"
echo "2. 选择 'External' 用户类型"
echo "3. 填写应用信息："
echo "   - 应用名称: ShopSaaS"
echo "   - 用户支持邮箱: 你的邮箱"
echo "   - 开发者联系邮箱: 你的邮箱"
echo "4. 在作用域页面，添加："
echo "   - ../auth/userinfo.email"
echo "   - ../auth/userinfo.profile"
echo ""
read -p "OAuth 同意屏幕配置完成后，按回车继续..."

echo ""
echo "📋 步骤 4: 创建 OAuth 2.0 客户端 ID"
echo "1. 访问: https://console.cloud.google.com/apis/credentials"
echo "2. 点击 '创建凭据' > 'OAuth 2.0 客户端 ID'"
echo "3. 应用类型: Web 应用"
echo "4. 名称: ShopSaaS Web Client"
echo "5. 授权的重定向 URI:"
echo "   - https://shopsaas.fly.dev/auth/google/callback"
echo "   - http://localhost:3000/auth/google/callback (开发用)"
echo ""
echo "⚠️  创建完成后，记录下 Client ID 和 Client Secret"
echo ""

read -p "请输入 Google Client ID: " GOOGLE_CLIENT_ID
read -p "请输入 Google Client Secret: " GOOGLE_CLIENT_SECRET

echo ""
echo "🚀 配置 Fly.io 密钥..."

if [[ -n "$GOOGLE_CLIENT_ID" && -n "$GOOGLE_CLIENT_SECRET" ]]; then
    fly secrets set \
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
        -a shopsaas
    
    echo "✅ Google OAuth 配置完成！"
    echo ""
    echo "🧪 测试步骤："
    echo "1. 访问: https://shopsaas.fly.dev/"
    echo "2. 点击 'Sign in with Google' 按钮"
    echo "3. 完成 Google 登录流程"
    echo ""
    echo "📊 监控日志："
    echo "fly logs -a shopsaas | grep -i google"
else
    echo "❌ Client ID 或 Client Secret 为空，请重新运行脚本"
    exit 1
fi

echo ""
echo "🎉 配置完成！Google OAuth 登录现已可用。"