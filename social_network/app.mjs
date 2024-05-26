import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import MongoDBStoreFactory from 'connect-mongodb-session';

const { Schema, Document } = mongoose;

const app = express();

// Passport local strategy for handling auth
app.use(passport.initialize());
// Tell Express to use sessions
app.use(passport.session());


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
    salt: {type: Number, required: true},
    email: {type: String,
        required: false,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']}
    });
 
 
// Compile the model
const User = mongoose.model('User', userSchema);

 
// Create user using schema
async function createUser() {
	try {
		// Create a new instance of the model
		const user = new User({
			username: "Jenny",
			password: "password123",
			salt: 123456789,
			email: "jenny@jenandben.com"
		});
		// Try to save
		await user.save();
	} catch (err){
		// If we have an error, print the message.
		console.log(err);
	}
}
 
 
createUser();


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
 
 
createPost();

// Passport Local Strategy for authentication
passport.use(new LocalStrategy(
    async (username, password, done) => { // Verify callback function for Local Strategy
        try {
            const user = await User.findOne({ username }); // Find user by username
            if (!user) { // If user not found
                return done(null, false, { message: 'Incorrect username.' }); // Return error message
            }
			// If we get here, the user is in the Db. Salt the
			// given password and compare to the Db.
			const hashedPassword = await bcrypt.hash(password, user.salt);
			if (hashedPassword === user.password) {
				// We're good here!
				return done(null, user);
			} else {
				// Bad password.
				return done(null, false, { message: 'Incorrect password.' });
			}
        } catch (err) {
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
// When a user tries to go to /profile, we check authentication first.
app.get('/profile', isAuthenticated, (req, res) => {
	res.send(`Hello ${req.user.username}, you are authenticated!`);
});





// Add a GET and POST route to a registration form.
// Add a GET and POST route to a login form.
// Add a GET and POST route for new posts. On the GET page, display all the previous posts added by the current user.