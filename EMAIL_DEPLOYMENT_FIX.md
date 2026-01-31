# Email Deployment Fix for Render

## Problem Identified

Your email service was experiencing `ETIMEDOUT` errors on Render due to:

-   Missing timeout configurations
-   No connection pooling
-   No retry logic
-   Basic SMTP settings not optimized for cloud deployment

## Solution Applied

### 1. Enhanced SMTP Configuration

Updated `src/Utils/emailService.ts` with cloud-optimized settings:

```typescript
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Cloud deployment optimizations
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        // Connection pooling for better performance
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000, // 20 seconds
        rateLimit: 5, // max 5 messages per rateDelta
        // Retry configuration
        retryDelay: 5000, // 5 seconds between retries
        retryAttempts: 3,
        // TLS options for better compatibility
        tls: {
            rejectUnauthorized: false
        }
    });
};
```

### 2. Added Retry Logic

All email functions now include:

-   3 retry attempts
-   5-second delays between retries
-   Better error logging with attempt numbers
-   Graceful failure handling

## Environment Variables for Render

Make sure these are set in your Render dashboard:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use this password (not your regular Gmail password) in `EMAIL_PASS`

## Alternative Email Services (If Gmail Still Fails)

### Option 1: SendGrid (Recommended for Production)

```typescript
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    });
};
```

### Option 2: Mailgun

```typescript
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
            user: process.env.MAILGUN_USER,
            pass: process.env.MAILGUN_PASS
        }
    });
};
```

### Option 3: AWS SES

```typescript
const createTransporter = () => {
    return nodemailer.createTransport({
        SES: {
            aws: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION
            }
        }
    });
};
```

## Deployment Steps

1. **Build and Deploy**:

    ```bash
    npm run build
    git add .
    git commit -m "Fix email timeout issues for cloud deployment"
    git push
    ```

2. **Verify Environment Variables** in Render dashboard:

    - `EMAIL_USER`
    - `EMAIL_PASS`
    - `MONGODB_URI`
    - `PORT`

3. **Monitor Logs** for email success/failure messages

## Testing

After deployment, test email functionality:

1. Register a new exhibitor
2. Check Render logs for email success messages
3. Verify emails are received

## Performance Improvements

The new configuration provides:

-   **Connection Pooling**: Reuses connections for better performance
-   **Rate Limiting**: Prevents Gmail rate limit issues
-   **Retry Logic**: Handles temporary network issues
-   **Extended Timeouts**: Accommodates cloud network latency
-   **Better Error Handling**: More informative error messages

## Monitoring

Watch for these log messages:

-   `Email sent successfully (attempt X): [messageId]`
-   `Error sending email (attempt X/3): [error]`
-   `Retrying in 5 seconds...`
-   `Failed to send email after all retries: [error]`

## If Issues Persist

1. **Check Gmail Security**: Ensure app password is correct
2. **Try Alternative Service**: Consider SendGrid or Mailgun
3. **Check Render Logs**: Look for specific error messages
4. **Verify Network**: Test SMTP connection from Render environment

## Expected Results

After this fix:

-   ✅ Emails should send successfully on Render
-   ✅ Faster email delivery with connection pooling
-   ✅ Better error handling and retry logic
-   ✅ More reliable email service in production

