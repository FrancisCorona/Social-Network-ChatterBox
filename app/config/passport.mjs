/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { getBase64 } from '../utils/convertPhoto.mjs';
import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import createLogger from './logger.mjs';
import dotenv from 'dotenv';

dotenv.config(); // Load environement variables

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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost/auth/github/callback',
    scope: ['user:email'] // Request user email scope
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Log the entire profile object to inspect its structure
        logger.info(`Received profile: ${JSON.stringify(profile, null, 2)}`);

        let email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        // If email is not provided in the profile, fetch it using GitHub API
        if (!email) {
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `token ${accessToken}`,
                    'User-Agent': 'Node.js'
                }
            });
            const emails = await emailsResponse.json();
            email = emails.find(e => e.primary && e.verified).email;
        }

        // Log the email and photo information for debugging
        logger.info(`Email extracted: ${email}`);
        const photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
        logger.info(`Photo URL extracted: ${photo}`);

        // If email is still not provided by GitHub, throw an error
        if (!email) {
            throw new Error('Email not provided by GitHub');
        }

        // Find the user in the database by email
        let user = await User.findOne({ email });

        // If photo is provided, convert it to base64
        let profilePic = null;
        if (photo) {
            profilePic = await getBase64(photo);
        }

        // If user is not found, create a new user
        if (!user) {
            user = new User({
                name: profile.displayName || profile.username,
                email: email,
                profilePic: profilePic
            });
            await user.save(); // Save the new user to the database
            logger.info(`New user created with GitHub OAuth: ${email}`);
        }

        // Log successful authentication
        logger.info(`User authenticated with GitHub OAuth: ${user.email}`);
        return done(null, user); // Return the authenticated user
    } catch (err) {
        // Log any errors that occur during authentication
        logger.error(`Error during GitHub OAuth authentication: ${err.message}`);
        return done(err); // Return the error
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