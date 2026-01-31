import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const userTypeMap = {
    attendee: 'ATT'
};

const userTypeLabels = {
    ATT: 'ATTENDEE'
};

const userTypeColors = {
    ATT: { primary: '#28a745', secondary: '#1e7e34' }
};

const generateQRCode = async (userData: any, userType: string): Promise<Buffer> => {
    const userId = userData.id || userData.email;
    const typeCode = userTypeMap[userType as keyof typeof userTypeMap];
    const qrCodeData = `GREEN_ENERGY_EVENT:${typeCode}:${userId}`;

    return await QRCode.toBuffer(qrCodeData, {
        width: 80,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });
};

const generateUserBadge = async (userData: any, userType: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const typeCode = userTypeMap[userType as keyof typeof userTypeMap];
            const colors = userTypeColors[typeCode as keyof typeof userTypeColors];
            const qrCodeBuffer = await generateQRCode(userData, userType);

            const doc = new PDFDocument({
                size: [250, 307],
                margin: 0
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.rect(0, 0, 250, 307).fill('#ffffff');

            try {
                const headerImagePath = path.join(__dirname, '../../images/badge_head.jpg');
                doc.image(headerImagePath, 0, 0, { width: 250, height: 150 });
            } catch {
                console.warn('Header image not found, using text header instead');
            }

            doc.fillColor('#000000')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(`${userData.firstName} ${userData.lastName}`, 0, 160, { align: 'center' });

            if (userType === 'attendee') {
                if (userData.organization) {
                    doc.fillColor('#000000').fontSize(8).font('Helvetica').text(userData.organization, 0, 175, { align: 'center' });
                }

                if (userData.occupation) {
                    doc.fillColor('#000000').fontSize(7).font('Helvetica').text(userData.occupation, 0, 185, { align: 'center' });
                }
            }

            doc.image(qrCodeBuffer, 110, 205, { width: 40, height: 40, align: 'center' });

            const badgeTypeText = userTypeLabels[typeCode as keyof typeof userTypeLabels];
            doc.rect(0, 262, 250, 20).fill('#2d5016');
            doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(badgeTypeText, 0, 269, { align: 'center' });

            try {
                const footerImagePath = path.join(__dirname, '../../images/badge_footer.jpg');
                doc.image(footerImagePath, 0, 282, { width: 250, height: 25 });
            } catch {
                console.warn('Footer image not found');
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateAttendeeBadge = async (attendeeData: any): Promise<Buffer> => {
    return generateUserBadge(attendeeData, 'attendee');
};

export { generateUserBadge };
