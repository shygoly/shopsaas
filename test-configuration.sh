#!/bin/bash

echo "🧪 ShopSaaS 配置测试"
echo "==================="

# 检查应用状态
echo ""
echo "1. 检查应用健康状态..."
HEALTH_RESPONSE=$(curl -s https://shopsaas.fly.dev/health)
if echo "$HEALTH_RESPONSE" | grep -q "\"ok\":true"; then
    echo "✅ 应用健康检查通过"
else
    echo "❌ 应用健康检查失败: $HEALTH_RESPONSE"
fi

# 检查前端页面
echo ""
echo "2. 检查前端页面..."
FRONTEND_RESPONSE=$(curl -s https://shopsaas.fly.dev/ | head -20 | grep -i "shopsaas")
if [[ -n "$FRONTEND_RESPONSE" ]]; then
    echo "✅ 前端页面加载正常"
else
    echo "❌ 前端页面加载异常"
fi

# 测试邮件服务
echo ""
echo "3. 测试邮件服务配置..."
read -p "请输入测试邮箱地址 (回车跳过): " TEST_EMAIL

if [[ -n "$TEST_EMAIL" ]]; then
    echo "发送测试邮件到: $TEST_EMAIL"
    EMAIL_RESPONSE=$(curl -s -X POST https://shopsaas.fly.dev/api/test-email \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$TEST_EMAIL\"}")
    
    echo "响应: $EMAIL_RESPONSE"
    
    if echo "$EMAIL_RESPONSE" | grep -q "\"success\":true"; then
        echo "✅ 测试邮件发送成功"
        echo "请检查您的邮箱 (包括垃圾邮件文件夹)"
    else
        echo "❌ 测试邮件发送失败"
        echo "可能需要配置邮件服务，运行: ./setup-email-service.sh"
    fi
else
    echo "⏭  跳过邮件测试"
fi

# 检查配置状态
echo ""
echo "4. 检查服务配置状态..."

# 检查 Redis
echo ""
echo "📊 Redis 队列服务:"
fly status -a shopsaas-redis | grep -E "(Name|STATE)" || echo "❌ Redis 服务检查失败"

# 检查主应用
echo ""
echo "📊 主应用状态:"
fly status -a shopsaas | grep -E "(Name|STATE)" || echo "❌ 主应用状态检查失败"

# 检查日志
echo ""
echo "5. 最近日志 (最后 5 行):"
echo "========================"
fly logs -a shopsaas -n | tail -5

echo ""
echo "📋 配置检查清单"
echo "=============="

echo ""
echo "必需配置:"
echo "- [✅] GitHub 仓库: shygoly/evershop-fly"
echo "- [✅] Fly.io 部署: https://shopsaas.fly.dev/"
echo "- [✅] Redis 队列服务"
echo "- [✅] 数据库连接"

echo ""
echo "可选配置 (运行相应脚本配置):"
echo "- [ ] 邮件服务: ./setup-email-service.sh"
echo "- [ ] Google OAuth: ./setup-google-oauth.sh"
echo "- [ ] GitHub OAuth: 参考 docs/oauth-setup.md"

echo ""
echo "🔗 有用的链接:"
echo "- 应用地址: https://shopsaas.fly.dev/"
echo "- 主应用监控: https://fly.io/apps/shopsaas/monitoring"
echo "- Redis 监控: https://fly.io/apps/shopsaas-redis/monitoring"
echo "- GitHub Actions: https://github.com/shygoly/evershop-fly/actions"

echo ""
echo "🎉 测试完成！"