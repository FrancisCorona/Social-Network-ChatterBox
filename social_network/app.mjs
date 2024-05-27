import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import MongoDBStoreFactory from 'connect-mongodb-session';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const app = express();
const port = 3000;

const MongoDBStore = MongoDBStoreFactory(session);

// Connection string from our instance on Atlas:
const uri = "mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Database and Collection
const dbName = 'mobileapp';
const collectionName = 'mobileapp';

// Create a MongoDBStore instance
const Store = new MongoDBStore({
	uri: uri, // MongoDB connection URI
	databaseName: dbName,
	collection: 'sessions' // Collection name for storing sessions
});

// Catch errors
Store.on('error', function(error) {
	console.error('MongoDBStore error:', error);
});

// Listen on port for calls
app.listen(port, () => {
     console.log(`Our app is listening on port ${port}`);
	 });

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

// Use express.json middleware for json parsing
app.use(express.json());

// Configure express-session middleware
app.use(session({
	secret: '12345', // Secret key for session encryption
	resave: false,
	saveUninitialized: false,
	store: Store, // Use MongoDBStore as the session store
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 // Session expiration time (1 day)
	}
}));

// Passport local strategy for handling auth
app.use(passport.initialize());

// Tell Express to use sessions
app.use(passport.session());
 
async function connectDB() {
	try {
		await mongoose.connect(uri, {
			dbName: dbName,
		});
		console.log('Connected to MongoDB!');
	} catch (error) {
		console.error('Connection error', error);
	}
}
 
connectDB();
 
// Create the User Schema
const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    email: {type: String, match: [/.+\@.+\..+/, 'Please fill a valid email address']}
});
 
// Compile the model
const User = mongoose.model('User', userSchema);

// Create user using schema
async function createUser() {
	try {
		const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);

		// Create a new instance of the model
		const user = new User({
			username: "user",
			password: hashedPassword,
			salt: salt,
			email: "test@test.com"
		});
		// Try to save
		await user.save();
	} catch (err){
		// If we have an error, print the message.
		console.log(err);
	}
}

// Only call if you want to create a new test user
//createUser();

// Create a Post Schema and Model. A Post should link to the User that created it; so it must have a user field of type mongoose.Schema.Types.ObjectId, and a ref of 'User'. You can read more about linking here.

// Create the Post Schema
const postSchema = new Schema({
//	_id: { type: Schema.Types.ObjectId, ref: "User" },
	title: {type: String, required: true},
	caption: {type: String, required: false},
	content: {type: String, required: true},
	timestamp: {type: Date, default: Date.now, required: true},
	// user: {type: Schema.Types.ObjectId, ref: 'User', required: true} // Reference User schema
    });
 

// Compile the model
const Post = mongoose.model('Post', postSchema);

// Create post using schema
async function createPost() {
	try {

		// Create a new instance of the model
		const post = new Post({
			title: "Hello",
			caption: "what a wonderful day it is!",
			content: "post.jpg",
			user: "Jenny"
		});
		// Try to save
		await post.save();
	} catch (err){
		// If we have an error, print the message.
		console.log(err);
	}
}
 
//createPost();

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    async (username, password, done) => { // Verify callback function for Local Strategy
        try {
            const user = await User.findOne({ username }); // Find user by username
            if (!user) { // If user not found
				console.log('User not found');
                return done(null, false, { message: 'User not found' }); // Return error message
            }
			// If we get here, the user is in the Db. Salt the
			// given password and compare to the Db.
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
            return done(err); // Return any errors
        }
    }
));

// Serialize user to store in session
passport.serializeUser((user, done) => {
	// Just storing the id in the session.
	done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
	// Pull the User data from the database
	// given the id in the session.
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

// Create a function that can be called to check our auth status
function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.get('/register', (req, res) => {
    res.send(`
        <form action="/register" method="post">
            <br/>Username: <input type="text" name="username">
			<br/>Email: <input type="email" name="email">
            <br/>Password: <input type="password" name="password">
            <br/><button type="submit">Register</button>
        </form>
		<a href="/login">Return to Login</a>
    `);
});

app.get('/login', (req, res) => {
	res.send(`
		<form action="/login" method="post">
			<br/>Username: <input type="text" name="username">
			<br/>Password: <input type="password" name="password">
			<br/><button type="submit">Login</button>
		</form>
        <a href="/register">Click to Register</a>
	`);
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/profile',
	failureRedirect: '/login'
}));

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
		 // Check if the password is empty
		 if (!password) {
            throw new Error('password required');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword,
            salt: salt,
            email
        });

        await user.save();
		console.log('Successfully registered user:', username, email, password);
        res.redirect('/login');
    } catch (err) {
        let errorMessage = 'Error registering user';
		if (err.message === 'password required') {
			errorMessage = 'Password is required';
		} else if (err.name === 'ValidationError') {
			if (err.errors.email) {
                if (err.errors.email.kind === 'required') {
                    errorMessage = 'Email is required';
                } else if (err.errors.email.kind === 'user defined' || err.errors.email.kind === 'regexp') {
                    errorMessage = 'Invalid email format';
                }
            } else if (err.errors.username && err.errors.username.kind === 'required') {
                errorMessage = 'Username is required';
            }
        } else if (err.code === 11000) { // Duplicate key error code
           errorMessage = 'User already exists, please login';
		   console.log(err.message);
        }
		console.error('Registration Error:', errorMessage);
        res.status(500).send(`
            <p style="color:red;">${errorMessage}</p>
            <a href="/register"><button>Back to Register</button></a>
        `);
    }
});

// When a user tries to go to /profile, we check authentication first.
app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        // Retrieve posts from the database
        const posts = await Post.find().sort({ timestamp: -1 });

        // Generate HTML to display posts
        let postListHTML = '<h1>Posts</h1>';
        if (posts.length === 0) {
            postListHTML += '<p>No posts available.</p>';
        } else {
            postListHTML += '<ul>';
            posts.forEach(post => {
                postListHTML += `
                    <li>
                        <h2>${post.title}</h2>
                        <p><strong>Caption:</strong> ${post.caption}</p>
                        <p><strong>Content:</strong> ${post.content}</p><br>
                    </li>
                `;
            });
            postListHTML += '</ul>';
        }

        // Display the generated HTML
        res.send(`
            Hello ${req.user.username}!<br><br>
            <form action="/post" method="post">
                <br/>Title: <input type="text" name="title">
				<br/>Caption: <input type="text" name="caption">
				<br/>Content: <input type="text" name="content">
				<br/><button type="submit">Post</button>
            </form><br><br>
            ${postListHTML}
        `);
		
    } catch (err) {
        console.err('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
    }
});

app.post('/post', isAuthenticated, async (req, res) => {
	const {title, caption, content} = req.body;
	try {
		// Create a new instance of the model
		const post = new Post({
			title: title,
			caption: caption,
			content: content,
			user: req.user.username
		});
		// Try to save
		await post.save();
		// Redirect the user to the profile page after post creation to refresh feed
        res.redirect('/profile');
	} catch (err) {
        let errorMessage = 'Error creating post';
		if (err.name === 'ValidationError') {
			if (err.errors.title && err.errors.title.kind === 'required') {
                errorMessage = 'Post title required';
            } else if (err.errors.content && err.errors.content.kind === 'required') {
                errorMessage = 'Post content required';
            }
        }
		console.error('Post Error:', errorMessage);
        res.status(500).send(`
            <p style="color:red;">${errorMessage}</p>
			<a href="/profile"><button>Go Back</button></a>
        `);
    }
});


// Add a GET and POST route for new posts. On the GET page, display all the previous posts added by the current user.