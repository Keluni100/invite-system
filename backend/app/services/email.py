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
        inviter_name: str, 
        team_name: str, 
        invitation_link: str,
        role: str
    ) -> tuple[bool, Optional[str]]:
        """Send a team invitation email"""
        
        subject = f"You're invited to join {team_name}!"
        
        # Text version
        text_content = f"""
Hi there!

{inviter_name} has invited you to join the "{team_name}" team as a {role}.

To accept this invitation and create your account, click the link below:
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
            <p><strong>{inviter_name}</strong> has invited you to join the <strong>"{team_name}"</strong> team as a <strong>{role}</strong>.</p>
            
            <p>To accept this invitation and create your account, click the button below:</p>
            
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

# Global email service instance
email_service = EmailService()