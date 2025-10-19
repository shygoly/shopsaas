#!/bin/bash

echo "📧 邮件服务配置向导"
echo "===================="

echo ""
echo "选择邮件服务提供商："
echo "1. Gmail SMTP (免费)"
echo "2. Resend (推荐，专业)"
echo "3. SendGrid (企业级)"
echo "4. 其他 SMTP"
echo ""

read -p "请选择 [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "📋 Gmail SMTP 配置"
        echo "=================="
        echo ""
        echo "⚠️  前置要求："
        echo "1. 需要一个 Gmail 账户"
        echo "2. 必须启用 2FA (两步验证)"
        echo "3. 需要生成应用专用密码"
        echo ""
        echo "🔧 生成应用密码步骤："
        echo "1. 访问: https://myaccount.google.com/security"
        echo "2. 在 '登录 Google' 部分，选择 '应用专用密码'"
        echo "3. 选择应用和设备，生成密码"
        echo "4. 复制 16 位密码 (格式: abcd efgh ijkl mnop)"
        echo ""
        
        read -p "请输入您的 Gmail 地址: " GMAIL_USER
        read -p "请输入应用专用密码 (16位): " GMAIL_APP_PASSWORD
        
        if [[ -n "$GMAIL_USER" && -n "$GMAIL_APP_PASSWORD" ]]; then
            fly secrets set \
                EMAIL_PROVIDER="smtp" \
                SMTP_HOST="smtp.gmail.com" \
                SMTP_PORT="587" \
                SMTP_SECURE="false" \
                SMTP_USER="$GMAIL_USER" \
                SMTP_PASS="$GMAIL_APP_PASSWORD" \
                EMAIL_FROM="$GMAIL_USER" \
                -a shopsaas
            
            echo "✅ Gmail SMTP 配置完成！"
        else
            echo "❌ 邮箱或密码不能为空"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "📋 Resend 配置"
        echo "=============="
        echo ""
        echo "🔧 获取 Resend API Key 步骤："
        echo "1. 访问: https://resend.com/signup"
        echo "2. 注册账户并验证邮箱"
        echo "3. 进入 Dashboard -> API Keys"
        echo "4. 点击 'Create API Key'"
        echo "5. 复制 API key (格式: re_xxxxxxxxx)"
        echo ""
        echo "📧 可选：添加自定义域名"
        echo "1. Dashboard -> Domains"
        echo "2. 添加您的域名"
        echo "3. 按指示设置 DNS 记录"
        echo ""
        
        read -p "请输入 Resend API Key: " RESEND_API_KEY
        read -p "请输入发件邮箱地址 (如: noreply@yourdomain.com): " EMAIL_FROM
        
        if [[ -n "$RESEND_API_KEY" && -n "$EMAIL_FROM" ]]; then
            fly secrets set \
                EMAIL_PROVIDER="resend" \
                RESEND_API_KEY="$RESEND_API_KEY" \
                EMAIL_FROM="$EMAIL_FROM" \
                -a shopsaas
            
            echo "✅ Resend 配置完成！"
        else
            echo "❌ API Key 或发件邮箱不能为空"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "📋 SendGrid 配置"
        echo "==============="
        echo ""
        echo "🔧 获取 SendGrid API Key 步骤："
        echo "1. 访问: https://sendgrid.com/signup"
        echo "2. 注册账户并验证"
        echo "3. Settings -> API Keys"
        echo "4. 点击 'Create API Key'"
        echo "5. 选择 'Restricted Access'"
        echo "6. 权限设置: Mail Send - Full Access"
        echo "7. 复制 API key (格式: SG.xxxxxxxxx)"
        echo ""
        
        read -p "请输入 SendGrid API Key: " SENDGRID_API_KEY
        read -p "请输入发件邮箱地址: " EMAIL_FROM
        
        if [[ -n "$SENDGRID_API_KEY" && -n "$EMAIL_FROM" ]]; then
            fly secrets set \
                EMAIL_PROVIDER="sendgrid" \
                SENDGRID_API_KEY="$SENDGRID_API_KEY" \
                EMAIL_FROM="$EMAIL_FROM" \
                -a shopsaas
            
            echo "✅ SendGrid 配置完成！"
        else
            echo "❌ API Key 或发件邮箱不能为空"
            exit 1
        fi
        ;;
        
    4)
        echo ""
        echo "📋 自定义 SMTP 配置"
        echo "=================="
        echo ""
        
        read -p "SMTP 主机地址: " SMTP_HOST
        read -p "SMTP 端口 (通常为 587 或 465): " SMTP_PORT
        read -p "是否使用 SSL/TLS (true/false): " SMTP_SECURE
        read -p "SMTP 用户名: " SMTP_USER
        read -p "SMTP 密码: " SMTP_PASS
        read -p "发件邮箱地址: " EMAIL_FROM
        
        if [[ -n "$SMTP_HOST" && -n "$SMTP_PORT" && -n "$SMTP_USER" && -n "$SMTP_PASS" && -n "$EMAIL_FROM" ]]; then
            fly secrets set \
                EMAIL_PROVIDER="smtp" \
                SMTP_HOST="$SMTP_HOST" \
                SMTP_PORT="$SMTP_PORT" \
                SMTP_SECURE="$SMTP_SECURE" \
                SMTP_USER="$SMTP_USER" \
                SMTP_PASS="$SMTP_PASS" \
                EMAIL_FROM="$EMAIL_FROM" \
                -a shopsaas
            
            echo "✅ 自定义 SMTP 配置完成！"
        else
            echo "❌ 请填写所有必需字段"
            exit 1
        fi
        ;;
        
    *)
        echo "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "🧪 测试邮件服务"
echo "=============="
echo ""
echo "1. 重启应用以应用新配置："
echo "   fly apps restart shopsaas"
echo ""
echo "2. 访问应用并测试邮件登录："
echo "   https://shopsaas.fly.dev/"
echo ""
echo "3. 监控日志以查看邮件发送状态："
echo "   fly logs -a shopsaas | grep -i -E '(mail|email|smtp)'"
echo ""
echo "🎉 邮件服务配置完成！Magic Link 登录现已可用。"