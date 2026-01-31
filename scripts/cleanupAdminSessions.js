import mongoose from 'mongoose';
import AdminSession from '../src/Models/AdminSession';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function cleanupAdminSessions() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(MONGODB_URI);
  const result = await AdminSession.deleteMany({ userId: { $exists: false } });
  console.log(`[cleanup] Deleted ${result.deletedCount} AdminSession(s) missing userId.`);
  await mongoose.disconnect();
}

cleanupAdminSessions().catch((err) => {
  console.error('[cleanup] Failed', err);
  process.exit(1);
});
