const nodemailer = require('nodemailer');

// Test nodemailer configuration
const testNodemailer = async () => {
    console.log('🧪 Testing nodemailer configuration...\n');

    // Test cPanel configuration
    const configs = [
        {
            name: 'cPanel SMTP (your domain email)',
            config: {
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
                }
            }
        }
    ];

    for (const { name, config } of configs) {
        console.log(`\n📧 Testing ${name}...`);

        try {
            const transporter = nodemailer.createTransport(config);

            // Test connection
            console.log('   🔌 Testing connection...');
            await transporter.verify();
            console.log('   ✅ Connection successful!');

            // Send test email
            console.log('   📤 Sending test email...');
            const info = await transporter.sendMail({
                from: config.auth.user,
                to: 'ebaadisu2@gmail.com',
                subject: `Test Email from ${name}`,
                text: `This is a test email from ${name} configuration.`,
                html: `
                    <h2>Test Email from ${name}</h2>
                    <p>This is a test email to verify the nodemailer configuration.</p>
                    <p><strong>Configuration:</strong> ${name}</p>
                    <p><strong>From:</strong> ${config.auth.user}</p>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                `
            });

            console.log('   ✅ Email sent successfully!');
            console.log(`   📧 Message ID: ${info.messageId}`);
            console.log(`   📨 From: ${config.auth.user}`);
        } catch (error) {
            console.log('   ❌ Test failed:');
            console.log(`   🔴 Error: ${error.message}`);
            console.log(`   🔴 Code: ${error.code || 'N/A'}`);
        }
    }

    console.log('\n🏁 Test completed!');
};

// Run the test
testNodemailer().catch(console.error);
