# 📞 Vapi Setup Guide for Priya

## Prerequisites
- Vapi account with a phone number
- OpenAI API key
- Deployed webhook endpoint

## Step 1: Deploy Your App

### Option A: Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy the app

### Option B: Use Local Tunnel
```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

## Step 2: Configure Vapi Webhook

1. Go to [Vapi Dashboard](https://app.vapi.ai)
2. Navigate to your phone number settings
3. Set the webhook URL to: `https://your-domain.com/api/webhook/vapi`

## Step 3: Configure Vapi Assistant

### Initial Prompt for Priya
```
You are Priya, a personal AI assistant. Your role is to:

1. **Answer calls professionally** - Greet callers warmly and introduce yourself as Priya
2. **Handle personal tasks** - Help with scheduling, reminders, and personal organization
3. **Take messages** - If the caller needs to speak with the person, take a detailed message
4. **Be helpful and friendly** - Maintain a warm, professional tone throughout the conversation
5. **Ask clarifying questions** - If something is unclear, ask for more details
6. **Summarize conversations** - At the end of each call, provide a brief summary

Key Guidelines:
- Always introduce yourself as "Priya, your personal AI assistant"
- Be polite, professional, and helpful
- If you can't help with something, offer to take a message
- Keep responses concise but informative
- Ask for the caller's name if they don't provide it
- End calls professionally with a summary

Remember: You're representing a personal assistant, so maintain a warm, helpful demeanor throughout the conversation.
```

### Vapi Configuration Settings
- **Model**: GPT-4 or GPT-3.5-turbo
- **Temperature**: 0.7 (for natural conversation)
- **Max Tokens**: 150 (for concise responses)
- **Webhook**: Enable and set to your endpoint

## Step 4: Test the Integration

1. Call your Vapi number
2. Speak with Priya
3. Check your email for the call summary
4. Verify the webhook is receiving data

## Step 5: Environment Variables

Make sure these are set in your deployment:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=patelpa1639@gmail.com
SENDGRID_TO_EMAIL=patelpa1639@gmail.com

# Assistant Configuration
ASSISTANT_NAME=Priya
ASSISTANT_ROLE=Personal AI Assistant
PERSONAL_EMAIL=patelpa1639@gmail.com
```

## Troubleshooting

### Webhook Not Receiving Calls
1. Check the webhook URL is correct
2. Verify your server is accessible
3. Check Vapi logs for errors

### No Email Summaries
1. Verify SendGrid API key is correct
2. Check email is not in spam folder
3. Verify sender email is verified in SendGrid

### Poor Call Quality
1. Adjust the initial prompt
2. Try different temperature settings
3. Test with different conversation styles

## Next Steps

Once connected:
1. Test with friends and family
2. Customize Priya's personality
3. Add more specific instructions for your needs
4. Monitor call summaries and adjust as needed 