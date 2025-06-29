# 🚀 Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel with serverless functions and environment variables.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com) (recommended)
- All API keys and credentials ready

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub (Recommended)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Vercel deployment"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### 1.2 Alternative: Deploy from Local Directory

You can also deploy directly from your local directory using the Vercel CLI.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository** (if using GitHub)
   - Select your repository
   - Vercel will auto-detect it's a Next.js project
4. **Configure project settings:**
   - Project Name: `your-project-name`
   - Framework Preset: `Next.js` (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [your-account]
# - Link to existing project? N
# - What's your project's name? [your-project-name]
# - In which directory is your code located? ./
# - Want to override the settings? N
```

## Step 3: Configure Environment Variables

### 3.1 Via Vercel Dashboard

1. **Go to your project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each environment variable:**

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback

# JWT Secret
JWT_SECRET=your_generated_jwt_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_sender@example.com
SENDGRID_TO_EMAIL=your_email@example.com
```

### 3.2 Via Vercel CLI

```bash
# Add environment variables
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REDIRECT_URI
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL
vercel env add SENDGRID_TO_EMAIL

# Redeploy with new environment variables
vercel --prod
```

## Step 4: Update Google OAuth2 Redirect URI

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Navigate to APIs & Services → Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Add your Vercel domain to Authorized redirect URIs:**
   ```
   https://your-domain.vercel.app/api/auth/callback
   ```

## Step 5: Test Your Deployment

### 5.1 Test the Main Application

1. **Visit your deployed URL:** `https://your-domain.vercel.app`
2. **Test Google Calendar integration**
3. **Test the webhook endpoints**

### 5.2 Test API Endpoints

```bash
# Test email sending
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"summary": "Test summary"}'

# Test webhook endpoint
curl -X GET https://your-domain.vercel.app/api/webhook/vapi

# Test Vapi webhook (with sample data)
curl -X POST https://your-domain.vercel.app/api/webhook/vapi \
  -H "Content-Type: application/json" \
  -d '{"id":"test","status":"completed","transcript":"Test transcript"}'
```

### 5.3 Test Pages

- **Main App:** `https://your-domain.vercel.app`
- **Webhook Tester:** `https://your-domain.vercel.app/test-webhook`
- **Email Tester:** `https://your-domain.vercel.app/test-email`

## Step 6: Configure Custom Domain (Optional)

1. **Go to your project dashboard**
2. **Navigate to Settings → Domains**
3. **Add your custom domain**
4. **Update DNS records as instructed**
5. **Update Google OAuth2 redirect URI with your custom domain**

## Step 7: Set Up Vapi Webhook (Production)

1. **Go to your Vapi dashboard**
2. **Configure webhook URL:**
   ```
   https://your-domain.vercel.app/api/webhook/vapi
   ```
3. **Test the webhook integration**

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure variables are added to the correct environment (Production)
   - Redeploy after adding environment variables
   - Check variable names match exactly

2. **API Routes Not Working**
   - Check function timeout settings in `vercel.json`
   - Ensure proper CORS headers
   - Verify API key permissions

3. **Google OAuth2 Issues**
   - Verify redirect URI matches exactly
   - Check that Google Calendar API is enabled
   - Ensure OAuth consent screen is configured

4. **SendGrid Email Issues**
   - Verify sender email is verified in SendGrid
   - Check API key permissions
   - Ensure recipient email is valid

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## Performance Optimization

### 1. Function Optimization

- API routes are automatically optimized for serverless
- Functions have a 30-second timeout (configurable in `vercel.json`)
- Cold starts are minimized with proper caching

### 2. Caching Strategy

- Static assets are automatically cached
- API responses can be cached using Next.js caching
- Consider implementing Redis for session storage in production

### 3. Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Sentry or similar
- Monitor function execution times and costs

## Security Best Practices

1. **Environment Variables**
   - Never commit sensitive data to git
   - Use Vercel's environment variable encryption
   - Rotate API keys regularly

2. **API Security**
   - Implement rate limiting
   - Add webhook signature verification
   - Use HTTPS for all communications

3. **Access Control**
   - Implement proper authentication
   - Use JWT tokens securely
   - Validate all inputs

## Cost Optimization

- Vercel Hobby plan includes 100GB-hours of serverless function execution
- Monitor usage in Vercel dashboard
- Optimize function execution time
- Use edge caching where possible

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Your app is now deployed and ready to use! 🎉** 