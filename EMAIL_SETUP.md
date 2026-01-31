# Email Setup Guide

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/green_energy_event

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Chapa Payment (if needed later)
Chapa_Secret_key=your-chapa-secret-key

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,https://green-energy.powerethio.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS` (not your regular Gmail password)

## Alternative Email Services

You can also use other email services by modifying the transporter configuration in `src/Utils/emailService.ts`:

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Custom SMTP
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Features Implemented

✅ **Email Confirmation**: Sends confirmation email after registration
✅ **PDF Badge**: Generates and attaches exhibitor badge PDF
✅ **Professional Template**: Email template similar to Saudi Elenex style
✅ **Error Handling**: Registration continues even if email fails
✅ **Event Details**: Includes all event information in email

## Testing

1. Set up your `.env` file with email credentials
2. Start the server: `npm start`
3. Register a new exhibitor through the frontend
4. Check the email inbox for the confirmation email with PDF badge

## Email Template Features

- Professional design matching the Saudi Elenex style
- Personalized greeting with exhibitor name
- Event details (dates, venue, hours)
- PDF badge attachment
- Contact information
- Responsive design for mobile devices
