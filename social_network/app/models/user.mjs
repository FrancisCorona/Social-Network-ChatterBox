import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    salt: { type: String },
    email: { type: String, match: [/.+\@.+\..+/, 'Please fill a valid email address'] } // Email must match the specified regex pattern
});
 
// Create a user model using the schema
const user = mongoose.model('User', userSchema);

export default user;