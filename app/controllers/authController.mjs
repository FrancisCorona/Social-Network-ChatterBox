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
        if (!password) throw new Error('Password is required');
        if (password !== password2) throw new Error('Passwords do not match');
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const profilePic = await fs.readFile('./css/images/ProfilePicDefault');

        // const user = new User({ name, password: hashedPassword, salt, email });
        const user = new User({
            name,
            email,
            password: hashedPassword,
            salt,
            profilePic: profilePic
        });
        await user.save();
        logger.info(`Successfully registered email: ${email}`);
        res.redirect('/login');
    } catch (err) {
        let errorMessage = 'Error registering user';
        if (err.name === 'ValidationError') {
            if (err.errors.email.kind === 'user defined' || err.errors.email.kind === 'regexp') {
                errorMessage = 'Invalid email format';
            } else if (err.errors.email && err.errors.email.kind === 'required') {
                errorMessage = 'Email is required';
            } else if (err.errors.name && err.errors.name.kind === 'required') {
                errorMessage = 'Name is required';
            }
        } else if (err.code === 11000) { // Duplicate key error code
            errorMessage = 'Email already has account, please log in';
        } else if (err.message === 'Password is required') {
            errorMessage = 'Password is required';
        } else if (err.message === 'Passwords do not match') {
            errorMessage = 'Passwords do not match';
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
            return res.redirect(`/login?error=${encodeURIComponent(info.message)}`);
        }
        req.logIn(user, err => {
            if (err) return next(err);
            return res.redirect('/profile');
        });
    })(req, res, next);
};