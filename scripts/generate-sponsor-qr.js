const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// The URL for the attendee page
const attendeeUrl = 'https://green-energy.powerethio.com/attendee';

// Output directory for the QR code
const outputDir = path.join(__dirname, '..', 'public');
const outputFile = path.join(outputDir, 'attendee-qr-code.png');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// QR Code options
const qrOptions = {
    type: 'png',
    quality: 0.92,
    margin: 1,
    color: {
        dark: '#000000', // QR code color
        light: '#FFFFFF' // Background color
    },
    width: 300, // Size of the QR code
    errorCorrectionLevel: 'M' // Error correction level (L, M, Q, H)
};

async function generateAttendeeQR() {
    try {
        console.log('Generating QR code for attendee page...');
        console.log(`URL: ${attendeeUrl}`);

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(attendeeUrl, qrOptions);

        // Convert data URL to buffer
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Save QR code to file
        fs.writeFileSync(outputFile, buffer);

        console.log(`✅ QR code generated successfully!`);
        console.log(`📁 Saved to: ${outputFile}`);
        console.log(`🔗 URL encoded: ${attendeeUrl}`);

        // Also generate a text file with the URL for reference
        const textFile = path.join(outputDir, 'attendee-url.txt');
        fs.writeFileSync(textFile, `Attendee Page URL: ${attendeeUrl}\nGenerated on: ${new Date().toISOString()}`);

        console.log(`📄 URL reference saved to: ${textFile}`);
    } catch (error) {
        console.error('❌ Error generating QR code:', error.message);
        process.exit(1);
    }
}

// Run the script
generateAttendeeQR();
