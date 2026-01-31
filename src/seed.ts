import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdminUser from './Models/AdminUser';
import AdminSession from './Models/AdminSession';
import CommunicationSettings from './Models/CommunicationSettings';
import CommunicationTemplate from './Models/CommunicationTemplate';
import { hashPassword } from './Utils/auth';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function seed() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('[seed] Connected to MongoDB');

  const email = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_SEED_NAME || 'Admin';

  let admin = await AdminUser.findOne({ email });
  if (!admin) {
    const passwordHash = await hashPassword(password);
    admin = await AdminUser.create({ email, passwordHash, name, role: 'ADMIN' });
    console.log('[seed] Admin user created');
  } else {
    console.log('[seed] Admin user already exists');
  }

  // Create an AdminSession for the admin user
  const sessionId = `seed-session-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 hours from now
  const existingSession = await AdminSession.findOne({ userId: admin._id, sid: sessionId });
  if (!existingSession) {
    await AdminSession.create({
      userId: admin._id,
      sid: sessionId,
      expiresAt,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    });
    console.log('[seed] Admin session created');
  } else {
    console.log('[seed] Admin session already exists');
  }

  const settings = await CommunicationSettings.findOne().lean();
  if (!settings) {
    await CommunicationSettings.create({
      smsCreditsTotal: 5000,
      smsCreditsUsed: 0,
      unsubscribes: 0,
      iosUsers: 0,
      androidUsers: 0,
      totalAppUsers: 0,
    });
    console.log('[seed] Communication settings created');
  }

  const defaults = [
    { key: 'welcome', name: 'Welcome Email', subject: 'Welcome to Invest Ethiopia Forum 2026' },
    { key: 'checkin-reminder', name: 'Check-in Reminder', subject: 'Important: Check-in Information' },
    { key: 'vip-invite', name: 'VIP Invitation', subject: 'Exclusive VIP Event Invitation' },
    { key: 'post-event', name: 'Post-Event Follow-up', subject: 'Thank You & Next Steps' },
  ];

  for (const tpl of defaults) {
    await CommunicationTemplate.findOneAndUpdate(
      { key: tpl.key },
      { $setOnInsert: tpl },
      { upsert: true, new: true }
    );
  }
  console.log('[seed] Communication templates ensured');

  await mongoose.disconnect();
  console.log('[seed] Done');
}

seed().catch((error) => {
  console.error('[seed] Failed', error);
  mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
