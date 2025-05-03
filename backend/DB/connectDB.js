import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials in logs

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increased timeout
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 5,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 10000,
            retryReads: true
        };

        // Add DNS resolution error handling
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            if (err.name === 'MongooseServerSelectionError') {
                console.error('DNS resolution error. Please check your network connection and MongoDB Atlas settings.');
            }
        });

        await mongoose.connect(mongoURI, options);
        
        console.log('MongoDB Connected Successfully!');
        
        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.error('Could not connect to MongoDB Atlas. Please check:');
            console.error('1. Your internet connection');
            console.error('2. MongoDB Atlas cluster status');
            console.error('3. IP whitelist settings in MongoDB Atlas');
            console.error('4. Database user credentials');
        }
        console.error('Full error:', error);
        process.exit(1);
    }
};

export { connectDB };