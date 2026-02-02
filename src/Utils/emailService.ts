import nodemailer from 'nodemailer';
import { FailedEmailService } from '../Services/FailedEmailService';
import { generateAttendeeBadge } from './badgeGenerator';

// Create transporter with cloud-optimized settings
export const createTransporter = () => {
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
      </head>
      <body style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f7fb;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#0f766e;padding:28px 32px;color:#ffffff;">
                    <h1 style="margin:0;font-size:22px;line-height:1.3;">Green Energy Technology Expo 2025</h1>
                    <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Registration Confirmed</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 32px;">
                    <h2 style="margin:0 0 8px;font-size:20px;">Welcome, ${firstName} ${lastName}!</h2>
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
                      Thank you for registering for the Green Energy Technology Expo 2025. Your seat is confirmed, and your attendee badge is attached to this email.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:12px;padding:16px;margin:16px 0;">
                      <tr>
                        <td style="font-size:13px;line-height:1.6;">
                          <strong>Registration Summary</strong><br/>
                          Registration type: ${registrationType || 'Attendee'}<br/>
                          Group size: ${groupSize || '1'}<br/>
                          Email: ${email}
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 10px;">
                      <tr>
                        <td align="left">
                          <a href="https://investethiopia.gov.et/" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:bold;">Explore Investment Resources</a>
                        </td>
                      </tr>
                    </table>

                    <h3 style="margin:18px 0 8px;font-size:16px;">Event Highlights</h3>
                    <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;line-height:1.6;">
                      <li>Cutting-edge clean energy innovations and technology showcases.</li>
                      <li>Networking with industry leaders, investors, and public stakeholders.</li>
                      <li>Practical sessions on policy, financing, and deployment.</li>
                    </ul>

                    <h3 style="margin:18px 0 8px;font-size:16px;">Plan Your Visit</h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;">
                      <tr>
                        <td style="padding:6px 0;"><strong>Dates:</strong> Dec 19–21, 2025</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;"><strong>Venue:</strong> Millennium Hall, Addis Ababa</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;"><strong>Badge:</strong> Print and bring your attached PDF for fast entry</td>
                      </tr>
                    </table>

                    <h3 style="margin:18px 0 8px;font-size:16px;">Resources</h3>
                    <p style="margin:0 0 6px;font-size:14px;line-height:1.6;">
                      Learn more about Ethiopia’s investment landscape and opportunities:
                    </p>
                    <ul style="margin:0 0 4px;padding-left:18px;font-size:14px;line-height:1.6;">
                      <li><a href="https://investethiopia.gov.et/" style="color:#0f766e;text-decoration:none;">Invest Ethiopia – Official Portal</a></li>
                      <li><a href="https://investethiopia.gov.et/" style="color:#0f766e;text-decoration:none;">Investment Opportunities & Sectors</a></li>
                      <li><a href="https://investethiopia.gov.et/" style="color:#0f766e;text-decoration:none;">News & Updates</a></li>
                    </ul>

                    <p style="margin:18px 0 0;font-size:14px;line-height:1.6;">
                      We look forward to welcoming you.
                    </p>
                    <p style="margin:6px 0 0;font-size:14px;line-height:1.6;">
                      Power Ethiopia Solar Technology Institute & Ethiopian Global Youth Group (EGYG)
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 32px 28px;color:#6b7280;font-size:12px;border-top:1px solid #eef2f7;">
                    This is an automated message. Please do not reply.<br/>
                    Contact: powerethiopiaco@gmail.com • +251 988 577 712
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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

