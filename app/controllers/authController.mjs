/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import passport from 'passport';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import User from '../models/user.mjs';
import createLogger from '../config/logger.mjs';

const logger = createLogger('authController-module');

export const registerUser = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    try {
        if (!password) throw new Error('Password is required'); // Check if the password is empty
        if (password !== password2) throw new Error('Passwords do not match'); // Check if the passwords match
        
        const salt = await bcrypt.genSalt(); // Generate salt for hashing password
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt

        const profilePic = await fs.readFile('./css/images/ProfilePicDefault');

        // Create a new instance of the model
        const user = new User({
            name,
            email,
            password: hashedPassword,
            salt,
            profilePic: profilePic
        });
        await user.save(); // Save the new user to the database
        logger.info(`Successfully registered email: ${email}`);
        res.redirect('/login'); // Redirect to login page on successful registration
    } catch (err) {
        let errorMessage = 'Error registering user';
        if (err.name === 'ValidationError') {
            if (err.errors.email.kind === 'user defined' || err.errors.email.kind === 'regexp') {
                errorMessage = 'Invalid email format'; // Specific error message for invalid email format
            } else if (err.errors.email && err.errors.email.kind === 'required') {
                errorMessage = 'Email is required'; // Specific error message for missing email
            } else if (err.errors.name && err.errors.name.kind === 'required') {
                errorMessage = 'Name is required'; // Specific error message for missing name
            }
        } else if (err.code === 11000) { // Duplicate key error code
            errorMessage = 'Email already has account, please log in';
        } else if (err.message === 'Password is required') {
            errorMessage = 'Password is required'; // Specific error message for missing password
        } else if (err.message === 'Passwords do not match') {
            errorMessage = 'Passwords do not match'; // Specific error message for mismatched passwords
        }
        logger.error(`Registration Error (${errorMessage}): ${err}`);
        res.redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }
};

export const loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            logger.error(`Login error: ${info.message}`);
            // Redirect to login with error message if authentication fails
            return res.redirect(`/login?error=${encodeURIComponent(info.message)}`);
        }
        req.logIn(user, err => {
            if (err) return next(err);
            return res.redirect('/profile');
        });
    })(req, res, next);
};