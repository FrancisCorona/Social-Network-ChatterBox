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
import { addFriend, removeFriend } from '../controllers/friendsController.mjs';
import createLogger from '../config/logger.mjs';

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

// Route to display registration form
router.get('/register', (req, res) => {
	// Get any error messages from the query string
	const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';
    res.send(`
		${errorMessage}
        <form action="/register" method="post">
            <br>Name: <input type="text" name="name">
			<br>Email: <input type="email" name="email">
            <br>Password: <input type="password" name="password">
            <br>Retype Password: <input type="password" name="password2">
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
        Welcome!! Please log in! &#128526
		<br>${errorMessage}
		<form action="/login" method="post">
			<br>Email: <input type="email" name="username">
			<br>Password: <input type="password" name="password">
			<br><button type="submit">Login</button>
		</form>
        <a href="/register">Click to Register</a>&nbsp|
		<a href="/auth/google">Log in with Google</a>&nbsp|
        <a href="/auth/github">Log in with Github</a>
	`); // Display login form and any error messages
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
            logger.into(`Logout error: {${err}}`);
            return res.status(500).send('Logout error');
        }
        res.redirect('/login');
    });
});

export default router;