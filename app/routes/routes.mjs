/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/11/24, 11:59 PM EDT
*/

import express from 'express';
import passport from 'passport';
import isAuthenticated from '../middleware/auth.mjs';
import { registerUser, loginUser } from '../controllers/authController.mjs';
import { getProfile, createPost } from '../controllers/postController.mjs';
import { addFriend, removeFriend } from '../controllers/friendsController.mjs';
import createLogger from '../config/logger.mjs';
import { uploadMiddleware, updateProfilePic } from '../controllers/profileController.mjs';

const logger = createLogger('routes-module');

const router = express.Router();

// Redirect from homepage to login page
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Route to display profile and posts
router.get('/profile', isAuthenticated, getProfile);

// Handle post creation requests
router.post('/post', isAuthenticated, createPost);

// Handle adding friends
router.post('/friend/:id', isAuthenticated, addFriend);

// Handle removing friends
router.post('/unfriend/:id', isAuthenticated, removeFriend);

// Handle updating profile picture
router.post('/updateAccount', isAuthenticated, uploadMiddleware, updateProfilePic);

// Route to display registration form
router.get('/register', (req, res) => {
    // Get any error messages from the query string
    const errorMessage = req.query.error ? req.query.error : '';
    res.render('register', { errorMessage });
});

// Handle registration requests
router.post('/register', registerUser);

// Route to display login form
router.get('/login', (req, res) => {
    // Get any error messages from the query string
    const errorMessage = req.query.error ? req.query.error : '';
    res.render('login', { errorMessage });
});

// Handle login requests
router.post('/login', loginUser);

// Route to start Google OAuth auth
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route to handle the callback from Google OAuth
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to profile.
        res.redirect('/profile');
    }
);

// Route to start Github OAuth auth
router.get('/auth/github',
    passport.authenticate('github', { scope: [ 'user:email' ] })
);

// Route to handle the callback from Github OAuth
router.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to profile.
        res.redirect('/profile');
    }
);

// Route to logout user
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            logger.error(`Logout error: ${err}`);
            return res.status(500).send('Logout error');
        }
        res.redirect('/login');
    });
});

export default router;