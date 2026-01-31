const nodemailer = require('nodemailer');

// Test email delivery with detailed logging
const testEmailDelivery = async () => {
    console.log('📧 Testing email delivery with detailed logging...\n');

    const transporter = nodemailer.createTransport({
        host: 'mail.powerethio.com',
        port: 465,
        secure: true,
        auth: {
            user: 'noreply@powerethio.com',
            pass: 'YpirP1]KF+h0w7dW'
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000,
        rateLimit: 5,
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug logging
        logger: true // Enable logger
    });

    try {
        console.log('🔌 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        console.log('📤 Sending test email...');
        const mailOptions = {
            from: {
                name: 'Green Energy Event',
                address: 'noreply@powerethio.com'
            },
            to: 'ebaadisu2@gmail.com',
            subject: 'Test Email Delivery - Green Energy Event',
            text: `
                This is a test email from Green Energy Event.
                
                If you receive this email, the delivery is working correctly.
                
                Test Details:
                - From: noreply@powerethio.com
                - Time: ${new Date().toISOString()}
                - Server: mail.powerethio.com
                
                Please check your spam folder if you don't see this email in your inbox.
            `,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2d5016;">Green Energy Event - Test Email</h2>
                    <p>This is a test email from Green Energy Event.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Test Details:</h3>
                        <ul>
                            <li><strong>From:</strong> noreply@powerethio.com</li>
                            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
                            <li><strong>Server:</strong> mail.powerethio.com</li>
                            <li><strong>Recipient:</strong> ebaadisu2@gmail.com</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        If you receive this email, the delivery is working correctly.<br>
                        Please check your spam folder if you don't see this email in your inbox.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📨 From: ${mailOptions.from.address}`);
        console.log(`📬 To: ${mailOptions.to}`);
        console.log(`📝 Subject: ${mailOptions.subject}`);

        console.log('\n🔍 Troubleshooting Tips:');
        console.log('1. Check your Gmail inbox');
        console.log('2. Check your Gmail spam/junk folder');
        console.log('3. Check Gmail Promotions tab');
        console.log('4. Look for emails from noreply@powerethio.com');
        console.log('5. Check if Gmail has any filters blocking the sender');
    } catch (error) {
        console.log('❌ Email sending failed:');
        console.log(`🔴 Error: ${error.message}`);
        console.log(`🔴 Code: ${error.code || 'N/A'}`);
        console.log(`🔴 Response: ${error.response || 'N/A'}`);
    }
};

// Run the test
testEmailDelivery().catch(console.error);



