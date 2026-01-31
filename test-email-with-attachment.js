const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// Create a test PDF attachment
const createTestPDF = () => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: [250, 307],
                margin: 0
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Create a simple test badge
            doc.rect(0, 0, 250, 307).fill('#ffffff');
            doc.fillColor('#2c5aa0').fontSize(16).font('Helvetica-Bold').text('Green Energy Event', 0, 50, { align: 'center' });
            doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('Test Badge', 0, 100, { align: 'center' });
            doc.fillColor('#000000').fontSize(10).font('Helvetica').text('Test User', 0, 120, { align: 'center' });
            doc.fillColor('#000000').fontSize(8).font('Helvetica').text('Test Company', 0, 135, { align: 'center' });
            doc.fillColor('#2d5016').fontSize(10).font('Helvetica-Bold').text('EXHIBITOR', 0, 280, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Test email with PDF attachment (like the real registration email)
const testEmailWithAttachment = async () => {
    console.log('📧 Testing email with PDF attachment (like real registration)...\n');

    try {
        // Create test PDF
        console.log('📄 Creating test PDF badge...');
        const pdfBuffer = await createTestPDF();
        console.log(`✅ PDF created successfully (${pdfBuffer.length} bytes)\n`);

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
            debug: true,
            logger: true
        });

        console.log('🔌 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        console.log('📤 Sending email with PDF attachment...');
        const mailOptions = {
            from: {
                name: 'Green Energy Event',
                address: 'noreply@powerethio.com'
            },
            to: 'ebaadisu2@gmail.com',
            subject: 'Test Email with PDF Attachment - Green Energy Event',
            attachments: [
                {
                    filename: 'Test_Badge.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ],
            text: `
                This is a test email with PDF attachment from Green Energy Event.
                
                If you receive this email with the PDF attachment, the delivery is working correctly.
                
                Test Details:
                - From: noreply@powerethio.com
                - Time: ${new Date().toISOString()}
                - Server: mail.powerethio.com
                - Attachment: Test_Badge.pdf (${pdfBuffer.length} bytes)
                
                Please check your spam folder if you don't see this email in your inbox.
            `,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2d5016;">Green Energy Event - Test Email with PDF</h2>
                    <p>This is a test email with PDF attachment from Green Energy Event.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Test Details:</h3>
                        <ul>
                            <li><strong>From:</strong> noreply@powerethio.com</li>
                            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
                            <li><strong>Server:</strong> mail.powerethio.com</li>
                            <li><strong>Recipient:</strong> ebaadisu2@gmail.com</li>
                            <li><strong>Attachment:</strong> Test_Badge.pdf (${pdfBuffer.length} bytes)</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        If you receive this email with the PDF attachment, the delivery is working correctly.<br>
                        Please check your spam folder if you don't see this email in your inbox.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email with PDF attachment sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📨 From: ${mailOptions.from.address}`);
        console.log(`📬 To: ${mailOptions.to}`);
        console.log(`📝 Subject: ${mailOptions.subject}`);
        console.log(`📎 Attachment: Test_Badge.pdf (${pdfBuffer.length} bytes)`);

        console.log('\n🔍 Troubleshooting Tips:');
        console.log('1. Check your Gmail inbox for the email with PDF attachment');
        console.log('2. Check your Gmail spam/junk folder');
        console.log('3. Check Gmail Promotions tab');
        console.log('4. Look for emails from noreply@powerethio.com');
        console.log('5. Check if the PDF attachment is included');
    } catch (error) {
        console.log('❌ Email sending failed:');
        console.log(`🔴 Error: ${error.message}`);
        console.log(`🔴 Code: ${error.code || 'N/A'}`);
        console.log(`🔴 Response: ${error.response || 'N/A'}`);

        if (error.message.includes('PDF') || error.message.includes('attachment')) {
            console.log('\n💡 The error might be related to PDF generation or attachment handling.');
        }
    }
};

// Run the test
testEmailWithAttachment().catch(console.error);



