/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import mongoose from 'mongoose';
import session from 'express-session';
import MongoDBStoreFactory from 'connect-mongodb-session';
import createLogger from './logger.mjs';

const logger = createLogger('db-module');

const MongoDBStore = MongoDBStoreFactory(session);

// MongoDB connection URI and database name
const uri = 'mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'mobileapp';

// Connect to MongoDB
async function connectDB() {
	try {
		await mongoose.connect(uri, { dbName: dbName }); // Connect to MongoDB with the specified URI and database name
		logger.info('Connected to MongoDB');
	} catch (err) {
		//logger.error(`MongoDB connection error: {${err.message}}`);
		logger.error(`MongoDB connection error: {${err.message}}`);
	}
}

export default connectDB;