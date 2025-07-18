# 📧 Outlook Email Setup Guide

## Production-Ready Outlook Configuration

Since you'll use Outlook in production, let's configure it now for `yasiralsadoon@gmail.com` with Outlook SMTP.

## 🔧 Outlook SMTP Configuration

### 1. Update Backend Configuration

Update your `backend/.env` file with Outlook SMTP settings:

```env
# Outlook/Office 365 SMTP Configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=yasiralsadoon@gmail.com
SMTP_PASSWORD=your-outlook-app-password
SMTP_FROM_EMAIL=yasiralsadoon@gmail.com
SMTP_FROM_NAME=Team Management System
```

### 2. Outlook App Password Setup

#### Option A: Microsoft Account (Personal Outlook)
1. **Go to Microsoft Account Security**: https://account.microsoft.com/security
2. **Enable Two-Step Verification** (required for app passwords)
3. **Go to "Advanced security options"**
4. **Click "Create a new app password"**
5. **Enter app name**: "Team Management System"
6. **Copy the generated password** (16 characters)
7. **Use this password** in `SMTP_PASSWORD`

#### Option B: Office 365 Business Account
1. **Go to Office 365 Admin Center**: https://admin.microsoft.com
2. **Users → Active Users → Select your account**
3. **Mail settings → Manage email apps**
4. **Enable "Authenticated SMTP"**
5. **Use your regular password** or generate app password

### 3. Alternative Configuration Files

Create Outlook-specific configuration:

```bash
# Create Outlook template
cp backend/.env backend/.env.outlook

# Edit with Outlook settings
nano backend/.env.outlook
```

**File: `backend/.env.outlook`**
```env
# Database
DATABASE_URL=sqlite:///./team_management.db

# Security
SECRET_KEY=dev-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Outlook SMTP Configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=yasiralsadoon@gmail.com
SMTP_PASSWORD=your-outlook-app-password-here
SMTP_FROM_EMAIL=yasiralsadoon@gmail.com
SMTP_FROM_NAME=Team Management System

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
REDIS_URL=redis://localhost:6379/0

# Application
APP_NAME=Team Management API
APP_VERSION=1.0.0
DEBUG=True
```

## 🔑 How to Get Outlook Credentials

### Step-by-Step for yasiralsadoon@gmail.com:

1. **If using Outlook.com (Personal)**:
   ```
   📧 Email: yasiralsadoon@gmail.com
   🔐 Password: App password from account.microsoft.com
   🏠 Host: smtp-mail.outlook.com
   🔌 Port: 587
   ```

2. **If using Office 365 Business**:
   ```
   📧 Email: yasiralsadoon@gmail.com  
   🔐 Password: Regular password or app password
   🏠 Host: smtp.office365.com
   🔌 Port: 587
   ```

3. **Enable SMTP Authentication**:
   - Personal Outlook: Enabled by default with app password
   - Office 365: May need admin to enable SMTP AUTH

### Quick Setup Commands:

```bash
# Use Outlook configuration
cp backend/.env.outlook backend/.env

# Edit with your credentials
nano backend/.env

# Restart backend server
cd backend && ./start-dev.sh
```

## 🚀 Testing Outlook Email Delivery

### 1. Start Servers with Outlook Config:
```bash
# Backend
cd backend && ./start-dev.sh

# Frontend  
cd frontend && npm run dev
```

### 2. Test Email Delivery:
1. **Login**: http://localhost:3000/dashboard
   - Email: `admin@example.com`
   - Password: `testpass123`

2. **Send Invitation**:
   - Enter: `test-outlook@example.com`
   - Click "Send Invitation"
   - Check backend console for Outlook delivery status

3. **Verify Status**:
   - See "Pending" status in member list
   - Backend shows: `✅ Email sent successfully via SMTP (Outlook)`

### 3. Real Email Test:
- Send invitation to any real email address
- Check actual email delivery through Outlook SMTP
- Verify invitation email formatting and links

## 🔍 Outlook SMTP Settings Reference

| Setting | Personal Outlook | Office 365 Business |
|---------|------------------|---------------------|
| **Host** | smtp-mail.outlook.com | smtp.office365.com |
| **Port** | 587 (TLS) | 587 (TLS) |
| **Security** | STARTTLS | STARTTLS |
| **Auth** | App Password | Password/App Password |
| **Username** | Full email address | Full email address |

## 🛠 Troubleshooting Outlook

### Common Issues:

1. **Authentication Failed**:
   - ✅ Use app password, not regular password
   - ✅ Enable 2-step verification first
   - ✅ Check if SMTP AUTH is enabled

2. **Connection Timeout**:
   - ✅ Verify host: smtp-mail.outlook.com or smtp.office365.com
   - ✅ Use port 587 with STARTTLS
   - ✅ Check firewall/network restrictions

3. **Office 365 Specific**:
   - ✅ Admin may need to enable SMTP AUTH
   - ✅ Check Exchange admin center settings
   - ✅ Verify licensing includes SMTP

### Backend Console Messages:
- ✅ `Email sent successfully to user@example.com: Sent via SMTP (Outlook)`
- ⚠️ `SMTP error: Authentication failed` 
- 📧 `Development mode - email logged` (localhost mode)

## 🎯 Production Benefits

Using Outlook now provides:
- **Same service** as production environment
- **Better reliability** than Gmail for business use
- **Office 365 integration** if using Microsoft ecosystem
- **Enterprise features** like advanced security
- **Proper testing** of actual production email flow

## 📋 Quick Start Checklist

- [ ] Get Outlook app password from account.microsoft.com
- [ ] Update `backend/.env` with Outlook SMTP settings
- [ ] Restart backend server
- [ ] Test invitation sending
- [ ] Verify email delivery to real addresses
- [ ] Confirm status tracking works
- [ ] Document credentials for production deployment

The system is now ready for production-grade email delivery with Outlook!