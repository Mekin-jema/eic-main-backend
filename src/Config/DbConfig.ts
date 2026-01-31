import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('MONGODB_URI is not set. Ensure your environment variables are loaded.');
}

export const Dbconnection = async () => {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to database', error);
        throw error;
    }
};

export default mongoose;
