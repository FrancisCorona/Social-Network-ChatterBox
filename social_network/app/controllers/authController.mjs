/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import passport from 'passport';
import bcrypt from 'bcrypt';
import User from '../models/user.mjs';
import createLogger from '../config/logger.mjs';

const logger = createLogger('authController-module');

export const registerUser = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    try {
		if (!password) { // Check if the password is empty
        	throw new Error('password required');
        } else if (password !== password2) { // Check if the passwords match
            throw new Error('mismatched passwords');
        }

        const salt = await bcrypt.genSalt(); // Generate salt for hashing password
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt
        // Create a new instance of the model
        const user = new User({
            name,
            password: hashedPassword,
            salt: salt,
            email
        });

        await user.save(); // Save the new user to the database
		logger.info(`Successfully registered email: ${email}`);
        res.redirect('/login'); // Redirect to login page on successful registration
    } catch (err) {
        let errorMessage = 'Error registering user'; // Default error message
        if (err.name === 'ValidationError') {
            if (err.errors.email.kind === 'user defined' || err.errors.email.kind === 'regexp') {
                errorMessage = 'Invalid email format'; // Specific error message for invalid email format
            } else if (err.errors.email && err.errors.email.kind === 'required') {
                errorMessage = 'Email is required'; // Specific error message for missing email
            } else if (err.errors.name && err.errors.name.kind === 'required') {
                errorMessage = 'Name is required'; // Specific error message for missing name
            }
        } else if (err.code === 11000) { // Duplicate key error code
            errorMessage = 'Email already has account, please log in'; // Specific error message for duplicate email
        } else if (err.message === 'password required') {
            errorMessage = 'Password is required'; // Specific error message for missing password
        } else if (err.message === 'mismatched passwords') {
            errorMessage = 'Passwords do not match'; // Specific error message for mismatched passwords
        }
        logger.error(`Registration Error (${errorMessage}): {${err}}`);
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
            logger.error(`Login error: ${info.message}`);
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