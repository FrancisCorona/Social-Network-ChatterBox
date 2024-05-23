import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const app = express();

app.use(passport.initialize());
    
// Connection string from our instance on Atlas:
const uri = "mongodb+srv://stewian:0zxyte7v7Oj6cQwp@cluster0.olbot2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Database and Collection
const dbName = 'mobileapp';
const collectionName = 'mobileapp';
 
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
 
// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true},
	id: {type: Number, required: true, unique: true},
    password: { type: String, required: true },
    salt: { type: Number, required: true },
    email: { type: String,
        required: false,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] }
    });
 
 
// Compile the model
const User = mongoose.model('User', userSchema);
export default User;
 
 
async function createUser() {
	try {
		// Create a new instance of the model
		const user = new User({
			username: "Jenny",
			password: "password123",
			id: 987654321,
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
// Install Passport and the Passport Local Strategy.
// Install Express Session middleware and setup to use your database as the session store.
// Add your Passport serialize and deserialize functions.
// Add a function that will be used for authentication to protect routes that need it.
// Add a GET and POST route to a registration form.
// Add a GET and POST route to a login form.
// Add a GET and POST route for new posts. On the GET page, display all the previous posts added by the current user.

