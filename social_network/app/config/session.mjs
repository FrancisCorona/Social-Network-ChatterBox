/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import session from 'express-session';
import MongoDBStoreFactory from 'connect-mongodb-session';
import createLogger from './logger.mjs';

const logger = createLogger('sessions-module');

const MongoDBStore = MongoDBStoreFactory(session);

// MongoDB connection URI and database name
const uri = 'mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'mobileapp';

// Create a MongoDBStore instance for session management
const store = new MongoDBStore({
	uri: uri, // MongoDB connection URI
	databaseName: dbName, // Name of databse to use
	collection: 'sessions' // Collection to store sessions in
});

// Catch errors from MongoDBStore
store.on('error', function(err) {
	logger.error(`MongoDBStore error: {${err}}`);
});

// Configure express-session middleware
const sessionMiddleware = session({
	secret: '12345', // Secret key for signing the session ID cookie
	resave: false, // Don't save session if unmodified
	saveUninitialized: false, // Don't create session until something stored
	store: store, // Use MongoDB store for session management
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 // Set session cookie expiration to 1 day
	}
});

export default sessionMiddleware;