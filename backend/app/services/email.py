import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.core.config import settings
import logging
import yagmail
import traceback

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name

    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        text_content: str = None
    ) -> tuple[bool, Optional[str]]:
        """Send an email using multiple methods with fallback"""
        
        # For development mode
        if self.smtp_host == "localhost" or not self.smtp_username:
            logger.info(f"""
            📧 DEVELOPMENT MODE - EMAIL CONTENT:
            To: {to_email}
            Subject: {subject}
            Content: {text_content or html_content[:200]}...
            """)
            print(f"""
            📧 DEVELOPMENT MODE - EMAIL NOT SENT
            To: {to_email}
            Subject: {subject}
            
            {text_content or html_content[:200]}...
            """)
            return True, "Development mode - email logged"

        # Try multiple email sending methods
        # Determine optimal method based on SMTP host
        if "outlook" in self.smtp_host.lower() or "office365" in self.smtp_host.lower():
            methods = [
                ("SMTP (Outlook)", self._send_with_smtp),
                ("YagMail (Fallback)", self._send_with_yagmail),
            ]
        else:
            methods = [
                ("YagMail (Gmail)", self._send_with_yagmail),
                ("SMTP (Standard)", self._send_with_smtp),
            ]
        
        for method_name, send_method in methods:
            try:
                print(f"📧 Attempting to send email using {method_name}...")
                success = await send_method(to_email, subject, html_content, text_content)
                if success:
                    logger.info(f"Email sent successfully to {to_email} using {method_name}")
                    print(f"✅ Email sent successfully to {to_email} using {method_name}")
                    return True, f"Sent via {method_name}"
            except Exception as e:
                error_msg = f"{method_name} failed: {str(e)}"
                logger.warning(error_msg)
                print(f"⚠️ {error_msg}")
                continue
        
        # All methods failed
        error_msg = "All email sending methods failed"
        logger.error(f"Failed to send email to {to_email}: {error_msg}")
        print(f"❌ Failed to send email to {to_email}")
        return False, error_msg

    async def _send_with_yagmail(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using YagMail (easier Gmail integration)"""
        try:
            yag = yagmail.SMTP(self.smtp_username, self.smtp_password)
            
            # Use HTML content or fallback to text
            content = html_content if html_content else text_content
            
            yag.send(
                to=to_email,
                subject=subject,
                contents=content
            )
            yag.close()
            return True
        except Exception as e:
            print(f"YagMail error: {str(e)}")
            traceback.print_exc()
            raise

    async def _send_with_smtp(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using standard SMTP (optimized for Outlook)"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            
            # Add Message-ID for better delivery
            import uuid
            message["Message-ID"] = f"<{uuid.uuid4()}@{self.smtp_host}>"

            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain", "utf-8")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)

            # Send email with enhanced error handling
            context = ssl.create_default_context()
            
            # Outlook/Office365 specific optimizations
            if "outlook" in self.smtp_host.lower() or "office365" in self.smtp_host.lower():
                print(f"📧 Using Outlook-optimized SMTP settings for {self.smtp_host}")
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                # Enable debug for troubleshooting
                server.set_debuglevel(0)
                
                # Start TLS
                server.starttls(context=context)
                
                # Authenticate
                if self.smtp_username and self.smtp_password:
                    print(f"📧 Authenticating with {self.smtp_username}")
                    server.login(self.smtp_username, self.smtp_password)
                    print(f"✅ SMTP authentication successful")
                
                # Send email
                server.sendmail(self.from_email, to_email, message.as_string())
                print(f"✅ Email sent successfully via SMTP")
                
            return True
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {str(e)}. Check username/password and app password settings."
            print(f"🔐 {error_msg}")
            raise Exception(error_msg)
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = f"SMTP Recipients refused: {str(e)}. Check email address validity."
            print(f"📧 {error_msg}")
            raise Exception(error_msg)
        except smtplib.SMTPServerDisconnected as e:
            error_msg = f"SMTP Server disconnected: {str(e)}. Check host and port settings."
            print(f"🔌 {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"SMTP error: {str(e)}"
            print(f"❌ {error_msg}")
            traceback.print_exc()
            raise Exception(error_msg)

    async def send_team_invitation(
        self, 
        to_email: str, 
        sister_name: str, 
        invitation_link: str,
    ) -> tuple[bool, Optional[str]]:
        """Send a mehram check"""
        
        subject = f"You've Been Registered As A Mehram{team_name}!"
        
        # Text version
        text_content = f"""
Assalaamu Alayka Wa Rahmatullahi Wa Baraktu!

{sister_name} has declared you as her mehram. She is inviting you to supervise her activities as she seeks marridge.

To accept this invitation, swear by Allah (swt) you are indeed her mehram. Then create your account, click the link below:
{invitation_link}

This invitation will expire in 7 days.

If you have any questions, please contact your team administrator.

Best regards,
Team Management System
        """
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation</title>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background-color: #4f46e5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background-color: #f9fafb; }}
        .button {{ 
            display: inline-block; 
            background-color: #4f46e5; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
        }}
        .footer {{ padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 You're Invited!</h1>
        </div>
        <div class="content">
            <h2>Join {team_name}</h2>
            <p>Hi there!</p>
            <p><strong>{sister_name}</strong> has invited you to to supervise her activities as she seeks marridge.
 <strong>" marridge."</strong> as a <strong>mehram</strong>.</p>
            
            <p>To accept this responsability and create your account, click the button below:</p>
            
            <a href="{invitation_link}" class="button">Accept Invitation</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">{invitation_link}</p>
            
            <p><strong>⏰ This invitation will expire in 7 days.</strong></p>
            
            <p>If you have any questions, please contact your team administrator.</p>
        </div>
        <div class="footer">
            <p>Team Management System</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        """
        
        success, message = await self.send_email(to_email, subject, html_content, text_content)
        return success, message
async def send_sister_verification(
    self,
    to_email: str,
    sister_name: str,
    guardian_name: str,
    verification_link: str,
    expiry_days: int = 7
) -> tuple[bool, Optional[str]]:
    """Send verification email to sister"""
    
    subject = f"Assalamu Alayke {sister_name} - Account Verification"
    
    # Text version
    text_content = f"""
Assalamu Alayke Wa Rahmatullahi Wa Barakatuhu {sister_name},

You have initiated account creation for yourself as part of our marriage system.

To verify your email address and activate your account, please click the link below:
{verification_link_sis}

Please complete verification within {expiry_days} days.

Important Notes:
1. This verification confirms your email address
2. Your guardian ({guardian_name}) has also been sent an email to verify separately
3. Both verifications are required for account activation

If you did not expect this email or have any concerns, please contact support immediately.

Barakallahu Feeke,
The Marriage Supervision System
    """
    
    # HTML version
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sister Account Verification</title>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .salam {{ font-size: 24px; margin-bottom: 10px; }}
        .content {{ padding: 30px; background-color: #f9fafb; }}
        .button {{ 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .important {{ 
            background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{ padding: 20px; text-align: center; color: #6b7280; font-size: 14px; background-color: #f1f5f9; border-radius: 0 0 10px 10px; }}
        .arabic {{ font-family: 'Traditional Arabic', 'Lateef', serif; direction: rtl; text-align: right; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="salam">السلام عليكم ورحمة الله وبركاته</div>
            <h1>Account Verification</h1>
        </div>
        
        <div class="content">
            <h2>Assalamu Alaikum {sister_name},</h2>
            
            <p>Your guardian <strong>{guardian_name}</strong> has initiated account creation for you in the Marriage Supervision System.</p>
            
            <p class="arabic">بارك الله فيك، الرجاء تأكيد بريدك الإلكتروني</p>
            
            <p><strong>Step 1:</strong> Verify your email address by clicking the button below:</p>
            
            <a href="{verification_link}" class="button">
                ✅ Verify My Email Address
            </a>
            
            <p>Or copy this link:<br>
            <code style="word-break: break-all; color: #4f46e5;">{verification_link}</code></p>
            
            <div class="important">
                <h3>📋 Important Information:</h3>
                <ol>
                    <li>This verifies <strong>your email address only</strong></li>
                    <li>Your guardian will verify <strong>separately</strong></li>
                    <li><strong>Both verifications</strong> are required for account activation</li>
                    <li>Link expires in <strong>{expiry_days} days</strong></li>
                </ol>
            </div>
            
            <p><strong>Security Note:</strong> If you did not expect this email or have concerns about this request, please contact support immediately.</p>
            
            <p class="arabic">جعل الله هذا في ميزان حسناتكم</p>
        </div>
        
        <div class="footer">
            <p>Marriage Supervision System | Protecting with Islamic Guidelines</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For support, please contact your system administrator.</p>
        </div>
    </div>
</body>
</html>
    """
    
    # Use the EXISTING send_email method
    success, message = await self.send_email(
        to_email=to_email,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    )
    
    return success, message
# Global email service instance
email_service = EmailService()