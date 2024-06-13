/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
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