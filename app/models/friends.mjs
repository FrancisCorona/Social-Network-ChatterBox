/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

import mongoose from 'mongoose';

// Define the post schema
const friendsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

// Create a post model using the schema
const friends = mongoose.model('Friends', friendsSchema);

export default friends;