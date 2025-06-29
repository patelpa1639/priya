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
GMAIL_USER=patelpa1639@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here

# Personal Configuration
PERSONAL_EMAIL=patelpa1639@gmail.com
ASSISTANT_NAME=Priya
ASSISTANT_ROLE=Personal AI Assistant
```

### 4. Test the Setup

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/test-email`
3. Click "Test Endpoint" to verify Gmail connection
4. Click "Send Email" to test sending

## Troubleshooting

### "Invalid username or password" error
- Make sure you're using the App Password, not your regular Gmail password
- Verify 2-factor authentication is enabled
- Check that the Gmail username is correct

### "Less secure app access" error
- This shouldn't happen with App Passwords
- Make sure you're using the App Password, not your regular password

### "Authentication failed" error
- Double-check the App Password (16 characters, no spaces)
- Ensure the Gmail username is your full email address

## Security Notes

- **Never commit your App Password to git**
- The App Password is specific to this application
- You can revoke it anytime from Google Account Settings
- It's more secure than using your regular password

## Production Deployment

When deploying to Vercel:

1. Add the same environment variables in Vercel dashboard
2. Use the same App Password
3. Test the email functionality after deployment

## Alternative: Use SendGrid (Optional)

If you prefer a more professional email service:

1. Sign up for [SendGrid](https://sendgrid.com/) (free tier available)
2. Create an API key
3. Verify your sender email
4. Update environment variables to use SendGrid instead

---

**Your Gmail setup is now complete! Priya can send you beautiful call summaries via email.** 🎉 