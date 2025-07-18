#!/bin/bash

# Email Provider Setup Script
echo "📧 Email Provider Configuration"
echo "================================"

echo "Available email providers:"
echo "1. Outlook (Production Ready)"
echo "2. Gmail (Alternative)"
echo "3. Development Mode (No real emails)"

read -p "Choose provider (1-3): " choice

case $choice in
    1)
        echo "🏢 Setting up Outlook..."
        cp .env.outlook .env
        echo "✅ Outlook configuration copied to .env"
        echo ""
        echo "📋 Next steps:"
        echo "1. Go to https://account.microsoft.com/security"
        echo "2. Enable two-step verification"
        echo "3. Create app password for 'Team Management System'"
        echo "4. Edit .env and replace 'YOUR_OUTLOOK_APP_PASSWORD_HERE' with your app password"
        echo ""
        echo "📝 Edit configuration:"
        echo "nano .env"
        ;;
    2)
        echo "📧 Setting up Gmail..."
        cp .env.gmail .env
        echo "✅ Gmail configuration copied to .env"
        echo ""
        echo "📋 Next steps:"
        echo "1. Go to https://myaccount.google.com/security"
        echo "2. Enable 2-factor authentication"
        echo "3. Generate app password for 'Mail'"
        echo "4. Edit .env and replace 'YOUR_APP_PASSWORD_HERE' with your app password"
        echo ""
        echo "📝 Edit configuration:"
        echo "nano .env"
        ;;
    3)
        echo "🛠 Setting up Development Mode..."
        sed -i.bak 's/SMTP_HOST=.*/SMTP_HOST=localhost/' .env
        echo "✅ Development mode configured"
        echo "📧 Emails will be logged to console instead of sent"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🚀 Restart the server to apply changes:"
echo "./start-dev.sh"