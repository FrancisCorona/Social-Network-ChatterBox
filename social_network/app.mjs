import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Initalize the passport session
app.use(passport.initialize());
    
// Connection string from our instance on Atlas:
const uri = "mongodb+srv://mrwoodring:somepassword@cluster0.2rcbnok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
 
async function connectDB() {
	try {
		await mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
		});
		console.log('Connected to MongoDB!');
	} catch (error) {
		console.error('Connection error', error);
	}
}
 
 
connectDB();
 
 
// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true }
    email: { type: String,
        required: false,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] }
    });
 
 
// Compile the model
const Student = mongoose.model('User', userSchema);
export default User;
 
 
async function createStudent() {
	try {
		// Create a new instance of the model
		const student = new Student({
			name: "Jenny Fromtheblock",
			email: "jenny@jenandben.com",
			gNumber: 11223837,	// Notice the bad gNumber!
			gpa: 4.0
		});
		// Try to save
		await student.save();
	} catch (err){
		// If we have an error (for instance here we used a bad
		// gNumber), print the message.
		console.log(err.errors['gNumber'].message);
	}
}
 
 
createStudent();
// Create a Post Schema and Model. A Post should link to the User that created it; so it must have a user field of type mongoose.Schema.Types.ObjectId, and a ref of 'User'. You can read more about linking here.
// Install Passport and the Passport Local Strategy.
// Install Express Session middleware and setup to use your database as the session store.
// Add your Passport serialize and deserialize functions.
// Add a function that will be used for authentication to protect routes that need it.
// Add a GET and POST route to a registration form.
// Add a GET and POST route to a login form.
// Add a GET and POST route for new posts. On the GET page, display all the previous posts added by the current user.

