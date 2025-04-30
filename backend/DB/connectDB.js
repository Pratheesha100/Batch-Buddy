import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Defined' : 'Not defined');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // List all collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Full error:', error);
        process.exit(1);
    }
};