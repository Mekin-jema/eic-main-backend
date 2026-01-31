const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateDatabaseSetup() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connection successful');

        // Test table creation by checking if we can query empty tables
        const attendeeCount = await prisma.attendeeRegistration.count();
        const exhibitorCount = await prisma.exhibitorRegistration.count();
        const sponsorCount = await prisma.sponsorRegistration.count();
        const contactCount = await prisma.contact.count();
        const transactionCount = await prisma.transaction.count();
        const vipLevelCount = await prisma.vipLevel.count();

        console.log('✅ Database Schema Validation Results:');
        console.log(`Attendees table: ${attendeeCount} records`);
        console.log(`Exhibitors table: ${exhibitorCount} records`);
        console.log(`Sponsors table: ${sponsorCount} records`);
        console.log(`Contacts table: ${contactCount} records`);
        console.log(`Transactions table: ${transactionCount} records`);
        console.log(`VIP Levels table: ${vipLevelCount} records`);

        console.log('✅ All tables created successfully');
        console.log('✅ Prisma migration completed successfully!');
    } catch (error) {
        console.error('❌ Database validation failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

validateDatabaseSetup();
