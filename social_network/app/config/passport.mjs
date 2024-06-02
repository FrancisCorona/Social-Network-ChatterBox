/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrtegy } from 'passport-github2';
import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import logger from './logger.mjs';

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    async (email, password, done) => {
        try {
			logger.info(`Attempting to find email: ${email}`);
            const user = await User.findOne({ email }); // Find user by username
            if (!user) { // If user not found
				logger.info('User not found');
                return done(null, false, { message: 'User not found' }); // Return error message
            }

			// If we get here, the email is in the DB
            logger.info('Email found:', email);
			
			// Salt the given password and compare to the DB
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				// We're good here!
				logger.info('Login successful');
				return done(null, user);
			} else {
				// Bad password
				logger.info('Incorrect password');
				return done(null, false, { message: 'Incorrect password' });
			}
        } catch (err) {
            // Check for specific bcrypt error and handle accordingly
            if (err.message.includes('data and hash arguments required')) {
                logger.info('Password comparison failed since they don\'t exist in db. User may need to log in with OAuth.');
                return done(null, false, { message: 'Please log in with Google or Github' });
            }
			logger.info('Error during authentication:', err);
            return done(err); // Error during authentication
        }
    }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: '282243348983-1o0t5lssu3gnh0oga6mvem9q0vm5cof4.apps.googleusercontent.com',
	clientSecret: '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',
    callbackURL: 'http://localhost/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Github OAuth Strategy
passport.use(new GithubStrtegy({
    clientID: 'Ov23limxUBHk46MOeoUt',
    clientSecret: '5a2653cae5c0f1f538c94a75d4642cd9b9049ec9',
    callbackURL: 'http://localhost/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


// Serialize user to store in session
passport.serializeUser((user, done) => {
	done(null, user.id); // Just storing the id in the session.
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id); // Find user by ID from DB
		done(null, user);
	} catch (err) {
		done(err); // Error during deserialization
	}
});

export default passport;