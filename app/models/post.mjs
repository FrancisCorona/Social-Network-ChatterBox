/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

import mongoose from 'mongoose';

// Define the post schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true},
    timestamp: { type: Date, default: Date.now, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to user model
});

// Create a post model using the schema
const post = mongoose.model('Post', postSchema);

export default post;