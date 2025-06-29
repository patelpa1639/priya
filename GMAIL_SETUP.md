# 📧 Gmail Setup for Priya

This guide will help you set up Gmail to send emails from Priya, your personal AI assistant.

## Why Gmail App Password?

Since you don't have SendGrid, we're using Gmail SMTP to send call summaries. This requires a special "App Password" for security.

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication (Required)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," click **2-Step Verification**
4. Follow the steps to enable 2-factor authentication

### 2. Generate App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google," click **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter a name like "Priya AI Assistant"
7. Click **Generate**
8. **Copy the 16-character password** (you won't see it again!)

### 3. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Gmail SMTP Configuration
# GMAIL_USER=patelpa1639@gmail.com
# GMAIL_APP_PASSWORD=your_password

# Add SendGrid settings
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=patelpa1639@gmail.com
SENDGRID_TO_EMAIL=patelpa1639@gmail.com

# Keep personal settings
PERSONAL_EMAIL=patelpa1639@gmail.com
ASSISTANT_NAME=Priya
ASSISTANT_ROLE=Personal AI Assistant
```