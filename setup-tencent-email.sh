#!/bin/bash

echo "📧 腾讯企业邮箱配置向导"
echo "======================"

echo ""
echo "📋 腾讯企业邮箱 SMTP 配置"
echo "========================"
echo ""
echo "⚠️  前置要求："
echo "1. 需要腾讯企业邮箱账户 (exmail.qq.com)"
echo "2. 需要开启 SMTP 服务"
echo "3. 建议使用专用的 noreply 账户"
echo ""

echo "🔧 开启 SMTP 服务步骤："
echo "1. 登录腾讯企业邮箱: https://exmail.qq.com/"
echo "2. 进入 '设置' -> '客户端设置'"
echo "3. 开启 '安全登录' 和 'IMAP/SMTP服务'"
echo "4. 记录下登录密码（或生成授权码）"
echo ""

# 获取邮箱配置
read -p "请输入企业邮箱地址 (如: noreply@yourcompany.com): " TENCENT_EMAIL
read -p "请输入邮箱密码 (或授权码): " TENCENT_PASSWORD

if [[ -z "$TENCENT_EMAIL" || -z "$TENCENT_PASSWORD" ]]; then
    echo "❌ 邮箱地址和密码不能为空"
    exit 1
fi

echo ""
echo "🚀 配置 Fly.io 密钥..."

fly secrets set \
    EMAIL_PROVIDER="smtp" \
    SMTP_HOST="smtp.exmail.qq.com" \
    SMTP_PORT="465" \
    SMTP_SECURE="true" \
    SMTP_USER="$TENCENT_EMAIL" \
    SMTP_PASS="$TENCENT_PASSWORD" \
    EMAIL_FROM="$TENCENT_EMAIL" \
    -a shopsaas

if [ $? -eq 0 ]; then
    echo "✅ 腾讯企业邮箱配置完成！"
    
    echo ""
    echo "📧 邮箱配置信息："
    echo "- SMTP 服务器: smtp.exmail.qq.com"
    echo "- 端口: 465 (SSL/TLS)"
    echo "- 发件邮箱: $TENCENT_EMAIL"
    echo "- 安全连接: 已启用"
    
    echo ""
    echo "🧪 测试邮件服务..."
    echo "等待应用重启..."
    sleep 10
    
    # 测试邮件发送
    read -p "是否发送测试邮件？输入接收邮箱地址 (回车跳过): " TEST_EMAIL
    
    if [[ -n "$TEST_EMAIL" ]]; then
        echo "发送测试邮件到: $TEST_EMAIL"
        RESPONSE=$(curl -s -X POST https://shopsaas.fly.dev/api/test-email \
            -H "Content-Type: application/json" \
            -d "{\"email\": \"$TEST_EMAIL\"}")
        
        echo "响应: $RESPONSE"
        
        if echo "$RESPONSE" | grep -q '"success":true'; then
            echo "✅ 测试邮件发送成功！"
            echo "请检查邮箱 (包括垃圾邮件文件夹)"
        else
            echo "❌ 测试邮件发送失败"
            echo "请检查配置或查看应用日志: fly logs -a shopsaas"
        fi
    fi
    
    echo ""
    echo "🎉 腾讯企业邮箱配置完成！"
    echo ""
    echo "📋 下一步："
    echo "1. 访问: https://shopsaas.fly.dev/"
    echo "2. 测试邮箱 Magic Link 登录"
    echo "3. 查看邮件日志: fly logs -a shopsaas | grep -i mail"
    
else
    echo "❌ Fly.io 密钥配置失败"
    exit 1
fi

echo ""
echo "📊 监控和调试："
echo "- 应用健康: curl https://shopsaas.fly.dev/health"
echo "- 应用日志: fly logs -a shopsaas"
echo "- 邮件日志: fly logs -a shopsaas | grep -i -E '(mail|smtp|email)'"