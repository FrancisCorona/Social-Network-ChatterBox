/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
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