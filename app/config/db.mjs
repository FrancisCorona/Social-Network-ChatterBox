/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import mongoose from 'mongoose';
import session from 'express-session';
import MongoDBStoreFactory from 'connect-mongodb-session';
import createLogger from './logger.mjs';

const logger = createLogger('db-module');

const MongoDBStore = MongoDBStoreFactory(session);

// MongoDB connection URI and database name
const uri = process.env.MONGODB_URI;
const dbName = 'mobileapp';

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(uri, { dbName: dbName }); // Connect to MongoDB with the specified URI and database name
        logger.info('Connected to MongoDB');
    } catch (err) {
        logger.error(`MongoDB connection error: {${err.message}}`);
    }
}

export default connectDB;