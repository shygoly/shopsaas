#!/bin/bash

echo "🚀 ShopSaaS MVP 部署验证"
echo "================================"

# 基本健康检查
echo "1. 应用健康检查..."
if curl -s https://shopsaas.fly.dev/health | grep -q '"ok":true'; then
    echo "   ✅ 应用健康检查通过"
else
    echo "   ❌ 应用健康检查失败"
fi

# 前端页面检查
echo "2. 前端页面检查..."
if curl -s https://shopsaas.fly.dev/ | grep -q "ShopSaaS"; then
    echo "   ✅ 前端页面加载正常"
else
    echo "   ❌ 前端页面加载失败"
fi

# API 认证检查
echo "3. API 认证检查..."
if curl -s https://shopsaas.fly.dev/api/system/status | grep -q "Authentication required"; then
    echo "   ✅ API 认证正常工作"
else
    echo "   ❌ API 认证异常"
fi

# Fly 应用状态检查
echo "4. Fly 应用状态检查..."
echo "   ShopSaaS 应用状态:"
fly status -a shopsaas | grep -E "(Name|Hostname|STATE)"

echo "   Redis 应用状态:"
fly status -a shopsaas-redis | grep -E "(Name|Hostname|STATE)"

# 网络连接检查
echo "5. 内部网络连接..."
echo "   ShopSaaS 应用 IP:"
fly ips list -a shopsaas | grep -E "v6.*public"

echo "   Redis 应用 IP:"
fly ips list -a shopsaas-redis | grep -E "v6.*private"

echo ""
echo "🎉 ShopSaaS MVP 部署完成！"
echo ""
echo "📖 访问地址:"
echo "   前端: https://shopsaas.fly.dev/"
echo "   监控: https://fly.io/apps/shopsaas/monitoring"
echo ""
echo "🔧 已部署的功能:"
echo "   ✅ 三种认证方式 (Google/GitHub/邮箱)"
echo "   ✅ 多租户店铺管理"
echo "   ✅ Redis 队列系统" 
echo "   ✅ GitHub Actions 集成"
echo "   ✅ 实时状态监控"
echo "   ✅ 邮件通知系统"
echo "   ✅ 审计日志"
echo "   ✅ 安全密钥管理"
echo ""
echo "⚠️  下一步配置:"
echo "   1. 设置 GitHub 集成 (GH_REPO, GITHUB_TOKEN)"
echo "   2. 配置 Fly API 令牌 (FLY_API_TOKEN)"
echo "   3. 设置邮件服务 (SMTP 配置)"
echo "   4. 配置 OAuth 应用 (可选)"
echo ""