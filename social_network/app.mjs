/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import MongoDBStoreFactory from 'connect-mongodb-session';
import bcrypt from 'bcrypt';
import winston from winston;

const { Schema } = mongoose;

const app = express(); // Create an instance of Express
const port = 80; // Set port number for the server

const MongoDBStore = MongoDBStoreFactory(session);

// MongoDB connection URI and database name
const uri = 'mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'mobileapp';

// Create a MongoDBStore instance for session management
const Store = new MongoDBStore({
	uri: uri, // MongoDB connection URI
	databaseName: dbName, // Name of databse to use
	collection: 'sessions' // Collection to store sessions in
});

// Catch errors from MongoDBStore
Store.on('error', function(error) {
	console.error('MongoDBStore error:', error);
});

// Start the server and listen on the specified port
app.listen(port, () => {
     console.log(`Our app is listening on port ${port}`);
});

// Middleware for parsing URL-encoded data (from forms)
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing JSON data
app.use(express.json());

// Configure express-session middleware
app.use(session({
	secret: '12345', // Secret key for signing the session ID cookie
	resave: false, // Don't save session if unmodified
	saveUninitialized: false, // Don't create session until something stored
	store: Store, // Use MongoDB store for session management
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 // Set session cookie expiration to 1 day
	}
}));

// Initialize passport for authentication
app.use(passport.initialize());
app.use(passport.session());
 
// Connect to MongoDB
async function connectDB() {
	try {
		await mongoose.connect(uri, { dbName: dbName }); // Connect to MongoDB with the specified URI and database name
		console.log('Connected to MongoDB!');
	} catch (error) {
		console.error('Connection error', error);
	}
}
 
connectDB(); // Call the function to connect to MongoDB
 
// Define the user schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    email: { type: String, match: [/.+\@.+\..+/, 'Please fill a valid email address'] } // Email must match the specified regex pattern
});
 
// Create a user model using the schema
const User = mongoose.model('User', userSchema);

// Define the post schema
const postSchema = new Schema({
    title: { type: String, required: true },
    caption: { type: String },
    content: { type: String, required: true},
    timestamp: { type: Date, default: Date.now, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Reference to user model
});
 
// Create a post model using the schema
const Post = mongoose.model('Post', postSchema);

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
			console.log(`Attempting to find user: ${username}`);
            const user = await User.findOne({ username }); // Find user by username
            if (!user) { // If user not found
				console.log('User not found');
                return done(null, false, { message: 'User not found' }); // Return error message
            }

			// If we get here, the user is in the DB
            console.log('User found:', user);
			
			// If we get here, the user is in the DB. Salt the given password and compare to the DB
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				// We're good here!
				console.log('Login successful');
				return done(null, user);
			} else {
				// Bad password
				console.log('Incorrect password');
				return done(null, false, { message: 'Incorrect password' });
			}
        } catch (err) {
			console.log('Error during authentication:', err);
            return done(err); // Error during authentication
        }
    }
));

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

// Middleware to check authentication
function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next(); // User is authenticated, proceed to the next middleware
	}
	res.redirect('/login'); // User is not authenticated, redirect to login
}

// Redirect from homepage to login page
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Route to display registration form
app.get('/register', (req, res) => {
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

// Route to display login form
app.get('/login', (req, res) => {
	// Get any error messages from the query string
	const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';
	res.send(`
		${errorMessage}
		<form action="/login" method="post">
			<br>Username: <input type="text" name="username">
			<br>Password: <input type="password" name="password">
			<br><button type="submit">Login</button>
		</form>
        <a href="/register">Click to Register</a>
	`); // Display login form and any error messages
});

// Handle login requests with custom callback
app.post('/login', (req, res, next) => {
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
  });

// Handle registration requests
app.post('/register', async (req, res) => {
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
		console.log('Successfully registered user:', username);
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
		console.error('Registration Error:', errorMessage);
		// Redirect to registration page with error message if error
		res.redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }
});

// Route to display profile and posts
app.get('/profile', isAuthenticated, async (req, res) => {
    try {
		// Find posts by user ID and sort by timestamp
        const posts = await Post.find({ user: req.user._id }).sort({ timestamp: -1 }).populate('user', 'username');

        // Generate HTML to display posts
        let postListHTML = '<h1>Posts</h1>';
        if (posts.length === 0) {
            postListHTML += '<p>No posts available &#128546</p>'; // Display message if no posts are available
        } else {
            postListHTML += '<ul>';
            posts.forEach(post => {
                postListHTML += `
                        <h2>${post.title}</h2>
                        ${post.caption ? `<p><strong>Caption:</strong> ${post.caption}</p>` : ''}
                        <p><strong>Content:</strong> ${post.content}</p><br>
                `; // Only display caption if not blank
            });
            postListHTML += '</ul>';
        }
		// Get any error messages from the query string
		const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';

        // Display the generated HTML
        res.send(`
            Hello ${req.user.username}! &#128515<br><br>
			${errorMessage}
            <form action="/post" method="post">
            	<br>Title: <input type="text" name="title">
				<br>Caption: <input type="text" name="caption">
				<br>Content: <input type="text" name="content">
				<br><button type="submit">Post</button>
            </form><br><br>
            ${postListHTML}
        `); // Display profile, posts, and any error messages
		
    } catch (err) {
        console.err('Error fetching posts:', err);
        res.status(500).send('Error fetching posts'); // Display error message if there's an issue fetching posts
    }
});

// Handle post creation requests
app.post('/post', isAuthenticated, async (req, res) => {
	const {title, caption, content} = req.body;
	try {
		// Create a new instance of the model
		const post = new Post({
			title: title,
			caption: caption,
			content: content,
			user: req.user._id // Set the user to the authenticated user's ID
		});
		await post.save(); // Save the new post to the database
        res.redirect('/profile'); // Redirect the user to the profile page after post creation to refresh feed
	} catch (err) {
        let errorMessage = 'Error creating post'; // Default error message
		if (err.name === 'ValidationError') {
			if (err.errors.title && err.errors.title.kind === 'required') {
                errorMessage = 'Post title required'; // Specific error message for missing title
            } else if (err.errors.content && err.errors.content.kind === 'required') {
                errorMessage = 'Post content required'; // Specific error message for missing content
            }
        }
		console.error('Post Error:', errorMessage);
		// Redirect to profile page with error message if authentication fails
		res.redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
    }
});

const winston = require('winston');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.File({ filename: 'combined.log' }),
		new winston.transports.Console({ format: winston.format.simple(), }),
	],
});

// Console
new winston.transports.Console()
// File named 'errors.log'
new winston.transports.File({filename: 'errors.log'});
// Remote HTTP server
new winston.transports.Http({ host: 'https://myLogServer.com', port: 443 })