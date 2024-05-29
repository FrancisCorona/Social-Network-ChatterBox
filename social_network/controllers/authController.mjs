import passport from 'passport';
import bcrypt from 'bcrypt';
import logger from '../config/logger.mjs';
import User from '../models/user.mjs';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
		if (!password) { // Check if the password is empty
        	throw new Error('password required');
        }

        const salt = await bcrypt.genSalt(); // Generate salt for hashing password
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt

        const user = new User({
            username,
            password: hashedPassword,
            salt: salt,
            email
        });

        await user.save(); // Save the new user to the database
		logger.info('Successfully registered user:', username);
        res.redirect('/login'); // Redirect to login page on successful registration
    } catch (err) {
        let errorMessage = 'Error registering user'; // Default error message
        if (err.message === 'password required') {
            errorMessage = 'Password is required'; // Specific error message for missing password
        } else if (err.name === 'ValidationError') {
            if (err.errors.email.kind === 'user defined' || err.errors.email.kind === 'regexp') {
                errorMessage = 'Invalid email format'; // Specific error message for invalid email format
            } else if (err.errors.username && err.errors.username.kind === 'required') {
                errorMessage = 'Username is required'; // Specific error message for missing username
            }
        } else if (err.code === 11000) { // Duplicate key error code
            errorMessage = 'User already exists, please login'; // Specific error message for duplicate username
        }
        logger.error('Registration Error:', errorMessage);
        // Redirect to registration page with error message if error
        res.redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }
};

export const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Handle error
        }
        if (!user) {
            // Redirect to login with error message if authentication fails
            return res.redirect(`/login?error=${encodeURIComponent(info.message)}`);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Handle error during login
            }
            // Redirect to profile on successful login
            return res.redirect('/profile');
        });
    })(req, res, next);
};