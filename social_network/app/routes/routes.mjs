/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import express from 'express';
import passport from 'passport';
import isAuthenticated from '../middleware/auth.mjs';
import { registerUser, loginUser } from '../controllers/authController.mjs';
import { getProfile, createPost } from '../controllers/postController.mjs';
import logger from '../config/logger.mjs';

const router = express.Router();

// Redirect from homepage to login page
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Route to display profile and posts
router.get('/profile', isAuthenticated, getProfile);

// Handle post creation requests
router.post('/post', isAuthenticated, createPost);

// Route to display registration form
router.get('/register', (req, res) => {
	// Get any error messages from the query string
	const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';
    res.send(`
		${errorMessage}
        <form action="/register" method="post">
            <br>Username: <input type="text" name="username">
			<br>Email: <input type="email" name="email">
            <br>Password: <input type="password" name="password">
            <br><button type="submit">Register</button>
        </form>
		<a href="/login">Return to Login</a>
    `); // Display registration form and any error messages
});

// Handle registration requests
router.post('/register', registerUser);

// Route to display login form
router.get('/login', (req, res) => {
	// Get any error messages from the query string
	const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';
	res.send(`
		${errorMessage}
		<form action="/login" method="post">
			<br>Username: <input type="text" name="username">
			<br>Password: <input type="password" name="password">
			<br><button type="submit">Login</button>
		</form>
        <a href="/register">Click to Register</a>&nbsp&nbsp
		<a href="/auth/google">Login with Google</a>
	`); // Display login form and any error messages
});

// Handle login requests
router.post('/login', loginUser);

// Route to start Google OAuth 2.0 authentication
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route to handle the callback from Google OAuth 2.0
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/profile');
    }
);

// Route to logout user
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            logger.into('Logout error:', err);
            return res.status(500).send('Logout error');
        }
        res.redirect('/login');
    });
});

export default router;