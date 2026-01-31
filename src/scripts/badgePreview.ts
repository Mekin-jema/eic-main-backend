import fs from 'fs';
import path from 'path';
import { generateAttendeeBadge } from '../Utils/badgeGenerator';

// Sample data for testing badge generation
const sampleData = {
    attendee: {
        id: 'ATT-001',
        firstName: 'Lemi ',
        lastName: 'Dinku',
        occupation: 'Software Engineer asdfsdf',
        organization: 'Tech Solutions Inc. asdfsdf'
    },
    
};

async function generatePreviewBadges() {
    console.log('🎫 Generating badge previews...\n');

    // Create preview directory if it doesn't exist
    const previewDir = path.join(__dirname, '../../preview');
    if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
    }

    try {
        // Generate Attendee Badge
        console.log('📋 Generating Attendee badge...');
        const attendeeBadge = await generateAttendeeBadge(sampleData.attendee);
        const attendeePath = path.join(previewDir, 'attendee_badge_preview.pdf');
        fs.writeFileSync(attendeePath, attendeeBadge);
        console.log(`✅ Attendee badge saved to: ${attendeePath}`);

        console.log('\n🎉 All badge previews generated successfully!');
        console.log('\n📁 Preview files location:');
        console.log(`   - ${attendeePath}`);
        console.log('\n💡 You can now open these PDF files to see how the badges will look!');
    } catch (error) {
        console.error('❌ Error generating badge previews:', error);
        process.exit(1);
    }
}

// Run the preview generation
if (require.main === module) {
    generatePreviewBadges();
}

export { generatePreviewBadges };
