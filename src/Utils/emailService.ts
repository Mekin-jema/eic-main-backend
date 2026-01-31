import nodemailer from 'nodemailer';
import { FailedEmailService } from '../Services/FailedEmailService';
import { generateAttendeeBadge } from './badgeGenerator';

// Create transporter with cloud-optimized settings
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'mail.powerethio.com', // cPanel SMTP server
        port: 465, // SSL port as per cPanel settings
        secure: true, // SSL/TLS as recommended by cPanel
        auth: {
            user: 'noreply@powerethio.com',
            pass: 'YpirP1]KF+h0w7dW'
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
        // TLS options for better compatibility
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email template for exhibitor registration confirmation
export const createExhibitorConfirmationEmail = async () => {
    throw new Error('Exhibitor emails removed');
};

// Email template for contact form confirmation
export const createContactConfirmationEmail = async (contactData: any) => {
    const { name, email, companyName, message } = contactData;

    return {
        from: 'noreply@powerethio.com',
        to: email,
        subject: 'Thank you for contacting us - Green Energy Technology Expo 2025',
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">Green Energy Technology Expo 2025</div>
            <h1>Thank You for Contacting Us!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for reaching out to us regarding the Green Energy Technology Expo 2025. We have received your message and will get back to you within 24 hours.</p>
            
            <p><strong>Your Message:</strong></p>
            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2c5aa0; margin: 15px 0;">
              "${message}"
            </p>
            
            <p>We appreciate your interest in our event and look forward to assisting you.</p>
            
            <p>Best regards,<br>
            Power Ethiopia Solar Technology Institute & Ethiopian Global Youth Group (EGYG)</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For urgent inquiries, please contact us directly.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };
};

// Function to send contact confirmation email with retry logic
export const sendContactConfirmationEmail = async (contactData: any) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const transporter = createTransporter();
            const emailOptions = await createContactConfirmationEmail(contactData);

            const result = await transporter.sendMail(emailOptions);
            console.log(`Contact email sent successfully (attempt ${attempt}):`, result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            lastError = error;
            console.error(`Error sending contact email (attempt ${attempt}/${maxRetries}):`, error);

            if (attempt < maxRetries) {
                console.log(`Retrying in 5 seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }

    // Save failed email to database
    try {
        const emailOptions = await createContactConfirmationEmail(contactData);
        await FailedEmailService.create({
            recipientEmail: contactData.email,
            recipientName: contactData.name,
            emailType: 'contact',
            subject: emailOptions.subject,
            htmlContent: emailOptions.html,
            errorMessage: (lastError as Error)?.message || 'Unknown error',
            originalData: contactData
        });
        console.log('Failed contact email saved to database');
    } catch (dbError) {
        console.error('Error saving failed contact email to database:', dbError);
    }

    console.error('Failed to send contact email after all retries:', lastError);
    return { success: false, error: lastError };
};

// Email template for attendee registration confirmation
export const createAttendeeConfirmationEmail = async (attendeeData: any) => {
    const { firstName, lastName, email, registrationType, groupSize } = attendeeData;

    // Generate attendee badge
    const badgeBuffer = await generateAttendeeBadge(attendeeData);

    return {
        from: 'noreply@powerethio.com',
        to: email,
        subject: 'Welcome to Green Energy Technology Expo 2025 - Registration Confirmed',
        attachments: [
            {
                filename: `GreenEnergyEvent_${firstName}_${lastName}_AttendeeBadge.pdf`,
                content: badgeBuffer,
                contentType: 'application/pdf'
            }
        ],
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .highlight {
            background-color: #e8f4f8;
            padding: 15px;
            border-left: 4px solid #2c5aa0;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">Green Energy Technology Expo 2025</div>
            <h1>Welcome to the Event!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>Thank you for registering for the Green Energy Technology Expo 2025! We're excited to have you join us for this premier event.</p>
            
            <div class="highlight">
              <p><strong>Please download your Attendee Badge attached to this email.</strong></p>
              <p><strong>Registration Details:</strong></p>
              <p>Thank you for registering as an attendee.</p>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>You will receive event updates and important information via email</li>
              <li>Print your badge and bring it to the event for quick entry</li>
              <li>Check our website for the latest agenda and speaker information</li>
            </ul>
            
            <p><strong>Event Information:</strong></p>
            <ul>
              <li>Theme: "Powering Ethiopia: Youth, Energy, and Innovation"</li>
              <li>Date: December 19-21, 2025 (Tahesas 10-12)</li>
              <li>Location: Millennium Hall, Addis Ababa</li>
              <li>Duration: 3 days</li>
            </ul>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br>
            Power Ethiopia Solar Technology Institute & Ethiopian Global Youth Group (EGYG)</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For questions, please contact us at powerethiopiaco@gmail.com or +251 988 577 712</p>
          </div>
        </div>
      </body>
      </html>
    `
    };
};

// Function to send attendee confirmation email with retry logic
export const sendAttendeeConfirmationEmail = async (attendeeData: any) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const transporter = createTransporter();
            const emailOptions = await createAttendeeConfirmationEmail(attendeeData);

            const result = await transporter.sendMail(emailOptions);
            console.log(`Attendee email sent successfully (attempt ${attempt}):`, result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            lastError = error;
            console.error(`Error sending attendee email (attempt ${attempt}/${maxRetries}):`, error);

            if (attempt < maxRetries) {
                console.log(`Retrying in 5 seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }

    // Save failed email to database
    try {
        const emailOptions = await createAttendeeConfirmationEmail(attendeeData);
        await FailedEmailService.create({
            recipientEmail: attendeeData.email,
            recipientName: `${attendeeData.firstName} ${attendeeData.lastName}`,
            emailType: 'attendee',
            subject: emailOptions.subject,
            htmlContent: emailOptions.html,
            errorMessage: (lastError as Error)?.message || 'Unknown error',
            originalData: attendeeData
        });
        console.log('Failed attendee email saved to database');
    } catch (dbError) {
        console.error('Error saving failed attendee email to database:', dbError);
    }

    console.error('Failed to send attendee email after all retries:', lastError);
    return { success: false, error: lastError };
};

// Exhibitor/sponsor emails removed.
export const sendExhibitorConfirmationEmail = async () => {
    throw new Error('Exhibitor emails removed');
};

export const createSponsorConfirmationEmail = async () => {
    throw new Error('Sponsor emails removed');
};

export const sendSponsorConfirmationEmail = async () => {
  throw new Error('Sponsor emails removed');
};

// Email template for exhibitor "under review" status
export const createExhibitorUnderReviewEmail = async () => {
    throw new Error('Exhibitor emails removed');
};

export const sendExhibitorUnderReviewEmail = async () => {
    throw new Error('Exhibitor emails removed');
};
