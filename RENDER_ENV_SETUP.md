# Render Deployment Environment Variables

## Required Environment Variables for Render

Add these to your Render service dashboard under "Environment" tab:

```env
# Email Configuration
EMAIL_USER=noreply@powerethio.com
EMAIL_PASS=YpirP1]KF+h0w7dW

# Server Configuration
NODE_ENV=production
PORT=10000

# Database (if using MongoDB)
MONGODB_URI=your-mongodb-connection-string

# CORS Origins (update with your frontend domain)
CORS_ORIGINS=https://your-frontend-domain.com,https://green-energy.powerethio.com
```

## Render Dashboard Setup Steps

1. **Go to your Render service dashboard**
2. **Click on "Environment" tab**
3. **Add each environment variable:**
    - Click "Add Environment Variable"
    - Enter the key (e.g., `EMAIL_USER`)
    - Enter the value (e.g., `noreply@powerethio.com`)
    - Click "Save"

## Email Configuration for Render

Your email service is now configured for Render with:

-   ✅ **Environment Variables**: Uses `process.env.EMAIL_USER` and `process.env.EMAIL_PASS`
-   ✅ **Cloud Optimized**: Reduced connection limits for Render
-   ✅ **SSL/TLS**: Secure connection to your cPanel email
-   ✅ **Error Handling**: Better error handling for cloud environment

## Testing on Render

After setting up environment variables:

1. **Redeploy your service** (Render will automatically redeploy when you add env vars)
2. **Check Render logs** for email success/failure messages
3. **Test registration** through your frontend
4. **Monitor email delivery** to ensure badges are sent

## Troubleshooting

If emails don't work on Render:

1. **Check Render logs** for error messages
2. **Verify environment variables** are set correctly
3. **Check cPanel email settings** - some hosts block external SMTP
4. **Consider using SendGrid** as alternative if cPanel SMTP is blocked

## Alternative: SendGrid for Render

If cPanel SMTP doesn't work on Render, consider using SendGrid:

```env
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

Then update the email service to use SendGrid SMTP settings.



