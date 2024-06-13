/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { getBase64 } from '../utils/convertPhoto.mjs';
import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import createLogger from './logger.mjs';

const logger = createLogger('passport-module');

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' }, // Explicitly specifying the fields
    async (email, password, done) => {
        logger.info(`Received email: ${email}`); // Log received email
        logger.info(`Received password: ${password}`); // Log received password
        try {
            logger.info(`Attempting to find user by email: ${email}`);
            const user = await User.findOne({ email }); // Find user by email
            if (!user) { // If user not found
                logger.warn(`User not found in database: ${email}`);
                return done(null, false, { message: 'User not found' }); // Return error message
            }

            // If we get here, the email is in the DB
            logger.info(`User found in database: ${email}`);
            
            // Compare the password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Password matches
                logger.info(`Login successful: ${email}`);
                return done(null, user);
            } else {
                // Password does not match
                logger.warn(`Incorrect password: ${email}`);
                return done(null, false, { message: 'Incorrect password' });
            }
        } catch (err) {
             // Catches specific bcrypt error where MongoDB document doesn't contain password and hash fields due to user initially creating account with oauth
            if (err.message.includes('data and hash arguments required')) {
                logger.error(`Password comparison failed. User may need to log in with OAuth: ${email} {${err.message}}`);
                return done(null, false, { message: 'Please log in with Google or Github' });
            }
            logger.error(`Error during authentication: ${email} {${err.message}}`);
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
        const profilePicURL = profile.photos[0].value;
        const updatedURL = profilePicURL.replace('=s96-c', '=s256-c');
        let profilePic = await getBase64(updatedURL);

        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePic: profilePic
            });
            await user.save();
            logger.info(`New user created with Google OAuth: ${profile.emails[0].value}`);
        }
        logger.info(`User authenticated with Google OAuth: ${user.email}`);
        return done(null, user);
    } catch (err) {
        logger.error(`Error during Google OAuth authentication: {${err.message}}`);
        return done(err);
    }
}));

// Github OAuth Strategy
passport.use(new GithubStrategy({
    clientID: 'Ov23limxUBHk46MOeoUt',
    clientSecret: '5a2653cae5c0f1f538c94a75d4642cd9b9049ec9',
    callbackURL: 'http://localhost/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        const profilePic = await getBase64(profile.photos[0].value);
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePic: profilePic
            });
            await user.save();
            logger.info(`New user created with GitHub OAuth: ${profile.emails[0].value}`);
        }
        logger.info(`User authenticated with GitHub OAuth: ${user.email}`);
        return done(null, user);
    } catch (err) {
        logger.error(`Error during GitHub OAuth authentication: {${err.message}}`);
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
        logger.error(`Error during deserialization: {${err.message}}`);
        done(err); // Error during deserialization
    }
});

export default passport;