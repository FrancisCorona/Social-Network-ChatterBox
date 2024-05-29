import mongoose from 'mongoose';
import session from 'express-session';
import MongoDBStoreFactory from 'connect-mongodb-session';
import logger from '../config/logger.mjs';

const MongoDBStore = MongoDBStoreFactory(session);

// MongoDB connection URI and database name
const uri = 'mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'mobileapp';

// Connect to MongoDB
async function connectDB() {
	try {
		await mongoose.connect(uri, { dbName: dbName }); // Connect to MongoDB with the specified URI and database name
		logger.info('Connected to MongoDB!');
	} catch (error) {
		logger.error('Connection error', error);
	}
}

export default connectDB;