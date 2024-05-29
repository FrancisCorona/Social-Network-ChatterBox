import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import logger from '../config/logger.mjs';

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
			logger.info(`Attempting to find user: ${username}`);
            const user = await User.findOne({ username }); // Find user by username
            if (!user) { // If user not found
				logger.info('User not found');
                return done(null, false, { message: 'User not found' }); // Return error message
            }

			// If we get here, the user is in the DB
            logger.info('User found:', user);
			
			// If we get here, the user is in the DB. Salt the given password and compare to the DB
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
			logger.info('Error during authentication:', err);
            return done(err); // Error during authentication
        }
    }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: '282243348983-hq7ctjclaa9l8bt9q7m7oh8b794gtmvk.apps.googleusercontent.com',
	clientSecret: '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',
    callbackURL: "http://localhost/auth/google/callback"
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
            });
            await user.save();
        }
        return cb(null, user);
    } catch (err) {
        return cb(err);
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