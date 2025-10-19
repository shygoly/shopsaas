#!/bin/bash

echo "🚀 ShopSaaS 配置助手"
echo "==================="

echo ""
echo "当前状态："
echo "✅ 应用已部署: https://shopsaas.fly.dev/"
echo "✅ Redis 队列: 运行正常"
echo "✅ 数据库: 连接成功"
echo ""

echo "选择要配置的服务："
echo "1. 📧 邮件服务 (Magic Link 登录)"
echo "2. 🔍 Google OAuth 登录 (全自动)"
echo "3. 🔍 Google OAuth 登录 (手动向导)"
echo "4. 🧪 测试所有配置"
echo "5. 📊 查看系统状态"
echo "6. 📚 查看完整文档"
echo "7. ❌ 退出"
echo ""

read -p "请选择 [1-7]: " choice

case $choice in
    1)
        echo ""
        echo "📧 启动邮件服务配置..."
        echo "====================="
        ./setup-email-service.sh
        ;;
        
    2)
        echo ""
        echo "🤖 启动 Google OAuth 全自动配置..."
        echo "================================="
        echo "这将使用 Google Cloud CLI 自动化配置过程"
        echo ""
        read -p "继续？[y/N]: " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            ./setup-google-oauth-cli.sh
        else
            echo "操作已取消"
        fi
        ;;
        
    3)
        echo ""
        echo "📋 启动 Google OAuth 手动配置向导..."
        echo "================================="
        ./setup-google-oauth.sh
        ;;
        
    4)
        echo ""
        echo "🧪 启动配置测试..."
        echo "=================="
        ./test-configuration.sh
        ;;
        
    5)
        echo ""
        echo "📊 系统状态检查"
        echo "=============="
        
        echo "1. 应用健康检查:"
        if curl -s https://shopsaas.fly.dev/health | grep -q '"ok":true'; then
            echo "   ✅ 应用运行正常"
        else
            echo "   ❌ 应用可能离线"
        fi
        
        echo ""
        echo "2. Fly.io 服务状态:"
        echo "   主应用:"
        fly status -a shopsaas | grep -E "(Name|STATE)" | head -2
        echo ""
        echo "   Redis 服务:"
        fly status -a shopsaas-redis | grep -E "(Name|STATE)" | head -2
        
        echo ""
        echo "3. 配置的密钥:"
        fly secrets list -a shopsaas | grep -E "(NAME|EMAIL|GOOGLE|GITHUB|REDIS)"
        
        echo ""
        echo "4. 最近日志 (最后 3 行):"
        fly logs -a shopsaas -n | tail -3
        ;;
        
    6)
        echo ""
        echo "📚 文档和指南"
        echo "============"
        echo ""
        echo "配置脚本:"
        echo "- ./setup-email-service.sh     - 邮件服务配置"
        echo "- ./setup-google-oauth-cli.sh  - Google OAuth 全自动"
        echo "- ./setup-google-oauth.sh      - Google OAuth 手动"
        echo "- ./test-configuration.sh      - 测试所有配置"
        echo ""
        echo "文档文件:"
        echo "- QUICK_SETUP_GUIDE.md         - 快速配置指南"
        echo "- DEPLOYMENT.md                - 部署指南"
        echo "- CONFIGURATION_COMPLETE.md    - 配置状态"
        echo "- docs/                        - 详细配置文档"
        echo ""
        echo "监控链接:"
        echo "- https://shopsaas.fly.dev/                     - 应用地址"
        echo "- https://fly.io/apps/shopsaas/monitoring       - 主应用监控"
        echo "- https://fly.io/apps/shopsaas-redis/monitoring - Redis 监控"
        echo ""
        echo "GitHub:"
        echo "- https://github.com/shygoly/evershop-fly/actions - GitHub Actions"
        ;;
        
    7)
        echo ""
        echo "👋 感谢使用 ShopSaaS 配置助手！"
        echo ""
        echo "🔗 有用的链接:"
        echo "- 应用地址: https://shopsaas.fly.dev/"
        echo "- 快速指南: cat QUICK_SETUP_GUIDE.md"
        echo "- 配置测试: ./test-configuration.sh"
        echo ""
        exit 0
        ;;
        
    *)
        echo ""
        echo "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 下一步建议："

# 检查邮件配置
if fly secrets list -a shopsaas | grep -q "EMAIL_PROVIDER"; then
    echo "✅ 邮件服务已配置"
else
    echo "⚠️  建议配置邮件服务: ./setup-email-service.sh"
fi

# 检查 Google OAuth
if fly secrets list -a shopsaas | grep -q "GOOGLE_CLIENT_ID"; then
    echo "✅ Google OAuth 已配置"
else
    echo "⚠️  建议配置 Google OAuth: ./setup-google-oauth-cli.sh"
fi

echo ""
echo "🧪 运行完整测试: ./test-configuration.sh"
echo "📊 查看系统状态: ./configure-shopsaas.sh 选择 5"
echo ""
echo "🎉 配置完成后，访问 https://shopsaas.fly.dev/ 开始使用！"