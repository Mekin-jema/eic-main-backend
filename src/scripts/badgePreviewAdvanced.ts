import fs from 'fs';
import path from 'path';
import { generateAttendeeBadge } from '../Utils/badgeGenerator';

// Interface for custom badge data
interface CustomBadgeData {
    attendee?: {
        id?: string;
        firstName: string;
        lastName: string;
        occupation: string;
        organization: string;
    };
    
}

// Default sample data
const defaultSampleData: CustomBadgeData = {
    attendee: {
        id: 'ATT-001',
        firstName: 'John',
        lastName: 'Doe',
        occupation: 'Software Engineer',
        organization: 'Tech Solutions Inc.'
    },
    
};

async function generateCustomBadgePreview(customData?: CustomBadgeData) {
    console.log('🎫 Generating custom badge previews...\n');

    // Use custom data or default sample data
    const dataToUse = customData || defaultSampleData;

    // Create preview directory if it doesn't exist
    const previewDir = path.join(__dirname, '../../preview');
    if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const results: string[] = [];

    try {
        // Generate Attendee Badge if data provided
        if (dataToUse.attendee) {
            console.log('📋 Generating Attendee badge...');
            const attendeeBadge = await generateAttendeeBadge(dataToUse.attendee);
            const attendeePath = path.join(previewDir, `attendee_badge_${timestamp}.pdf`);
            fs.writeFileSync(attendeePath, attendeeBadge);
            console.log(`✅ Attendee badge saved to: ${attendeePath}`);
            results.push(attendeePath);
        }

        

        console.log('\n🎉 Badge previews generated successfully!');
        console.log('\n📁 Generated files:');
        results.forEach(filePath => {
            console.log(`   - ${filePath}`);
        });
        console.log('\n💡 You can now open these PDF files to see how the badges will look!');

        return results;

    } catch (error) {
        console.error('❌ Error generating badge previews:', error);
        throw error;
    }
}

// Function to generate badges with your own test data
export async function generateTestBadges(testData: CustomBadgeData) {
    return await generateCustomBadgePreview(testData);
}

// Function to generate default sample badges
export async function generateSampleBadges() {
    return await generateCustomBadgePreview();
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🎫 Badge Preview Generator

Usage:
  npm run preview:badges:advanced [options]

Options:
  --help, -h          Show this help message
  --sample            Generate sample badges (default)
  --custom            Generate badges with custom data (requires data file)

Examples:
  npm run preview:badges:advanced --sample
  npm run preview:badges:advanced --custom

For custom data, create a JSON file with your test data and modify this script.
        `);
        return;
    }

    if (args.includes('--custom')) {
        // You can modify this section to load custom data from a file
        const customData: CustomBadgeData = {
            attendee: {
                firstName: 'Your',
                lastName: 'Name',
                occupation: 'Your Job Title',
                organization: 'Your Company'
            }
        };
        await generateCustomBadgePreview(customData);
    } else {
        // Default: generate sample badges
        await generateSampleBadges();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { generateCustomBadgePreview };

