/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import express from 'express';
import passport from './app/config/passport.mjs';
import connectDB from './app/config/db.mjs';
import sessionMiddleware from './app/config/session.mjs';
import Routes from './app/routes/routes.mjs';
import createLogger from './app/config/logger.mjs';

const logger = createLogger('app-module');

const app = express(); // Create an instance of Express
const port = 80; // Set port number for the server

connectDB(); // Call the function to connect to MongoDB

// Middleware for parsing URL-encoded data (from forms)
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing JSON data
app.use(express.json());

app.use(sessionMiddleware);

// Initialize passport for authentication
app.use(passport.initialize());
app.use(passport.session());

app.use('/', Routes);

// Start the server and listen on the specified port
app.listen(port, () => {
	logger.info(`Our app is listening on port ${port}`);
});