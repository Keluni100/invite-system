#!/usr/bin/env python3
"""
Simple email configuration test script
Tests SMTP connection without sending actual emails
"""

import asyncio
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_smtp_connection():
    """Test SMTP connection and authentication"""
    
    smtp_host = os.getenv('SMTP_HOST', 'localhost')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_username = os.getenv('SMTP_USERNAME', '')
    smtp_password = os.getenv('SMTP_PASSWORD', '')
    
    print("🔧 Testing Email Configuration")
    print("=" * 40)
    print(f"📡 Host: {smtp_host}")
    print(f"🔌 Port: {smtp_port}")
    print(f"👤 Username: {smtp_username}")
    print(f"🔐 Password: {'*' * len(smtp_password) if smtp_password else 'Not set'}")
    print()
    
    if smtp_host == 'localhost':
        print("🛠 Development mode detected - no real email testing")
        return True
    
    if not smtp_username or not smtp_password:
        print("❌ SMTP credentials not configured")
        print("💡 Run ./setup-email.sh to configure email provider")
        return False
    
    try:
        print("🔄 Testing SMTP connection...")
        
        # Create SSL context
        context = ssl.create_default_context()
        
        # Connect to server
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            print("✅ Connected to SMTP server")
            
            # Start TLS
            server.starttls(context=context)
            print("✅ TLS connection established")
            
            # Authenticate
            server.login(smtp_username, smtp_password)
            print("✅ Authentication successful")
            
        print()
        print("🎉 Email configuration is working!")
        
        # Detect provider
        if "outlook" in smtp_host.lower():
            print("📧 Outlook/Office365 SMTP detected")
        elif "gmail" in smtp_host.lower():
            print("📧 Gmail SMTP detected")
        else:
            print(f"📧 Custom SMTP server: {smtp_host}")
            
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("💡 Check your username/password or app password")
        return False
    except smtplib.SMTPServerDisconnected as e:
        print(f"❌ Server connection failed: {e}")
        print("💡 Check host and port settings")
        return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

async def test_email_service():
    """Test the actual email service"""
    try:
        from app.services.email import email_service
        
        print("\n🧪 Testing Email Service...")
        
        # Test sending to a fake email (won't actually send)
        success, message = await email_service.send_email(
            to_email={sister_email},
            subject={sister_subject},
            html_content={sister_subject},
            text_content={sister_text},
        )
        await email_service.send_email(  #you need to make these params right now they fake !
            to_email={mehram_email},
            subject={mehram_subject},
            html_content={mehram_html},
            text_content={mehram_text},
        )


        
        if success:
            print(f"✅ Email service test passed: {message}")
        else:
            print(f"⚠️ Email service test failed: {message}")
            
    except Exception as e:
        print(f"❌ Email service error: {e}")

if __name__ == "__main__":
    success = test_smtp_connection()
    
    if success:
        print("\n🚀 Ready to send invitations!")
        print("Start the server and test with real invitations")
    else:
        print("\n🔧 Configuration needed")
        print("Run ./setup-email.sh to configure email provider")