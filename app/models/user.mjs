/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String },
    salt: { type: String },
    email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please fill a valid email address'] }, // Email must match the specified regex pattern
    profilePic: { type: Buffer }
});
 
// Create a user model using the schema
const user = mongoose.model('User', userSchema);

export default user;