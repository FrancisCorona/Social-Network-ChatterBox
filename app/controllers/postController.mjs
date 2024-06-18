/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import Post from '../models/post.mjs';
import User from '../models/user.mjs';
import Friends from '../models/friends.mjs';
import createLogger from '../config/logger.mjs';
import { formatTimestamp } from '../utils/formatTimestamp.mjs';

const logger = createLogger('postController-module');

export const createPost = async (req, res) => {
    const { title, content } = req.body;
    try {
        // Create a new instance of the model
        const post = new Post({
            title: title,
            content: content,
            user: req.user._id // Set the user to the authenticated user's ID
        });
        await post.save(); // Save the new post to the database
        res.redirect('/profile'); // Redirect the user to the profile page after post creation to refresh feed
    } catch (err) {
        let errorMessage = 'Error creating post'; // Default error message
        if (err.name === 'ValidationError') {
            if (err.errors.title && err.errors.title.kind === 'required') {
                errorMessage = 'Post title required'; // Specific error message for missing title
            } else if (err.errors.content && err.errors.content.kind === 'required') {
                errorMessage = 'Post content required'; // Specific error message for missing content
            }
        }
        logger.error(`Post Error: ${req.user._id} ${errorMessage} - ${err}`);
        // Redirect to profile page with error message if authentication fails
        res.redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
    }
};

export const getProfile = async (req, res) => {
    try {
        // Find posts by user ID and sort by timestamp
        const userPosts = await Post.find({ user: req.user._id }).sort({ timestamp: -1 }).populate('user', 'name profilePic');
        logger.info(`Found ${userPosts.length} posts for user: ${req.user._id}`);

        // Find the user's friends
        const friendsRecord = await Friends.findOne({ user: req.user._id }).populate('friends');
        logger.info(`Found friends record for user: ${req.user._id}`);
        
        // Initialize an array to store friends' posts.
        let friendsPosts = [];

        if (friendsRecord && friendsRecord.friends.length > 0) {
            const friendsIds = friendsRecord.friends.map(friend => friend._id);
            logger.info(`User ${req.user._id} has ${friendsIds.length} friends`);
            
            // Find the posts of all friends
            friendsPosts = await Post.find({ user: { $in: friendsIds } }).sort({ timestamp: -1 }).populate('user', 'name profilePic');
            logger.info(`Found ${friendsPosts.length} posts from friends of user: ${req.user._id}`);
        }

        // Combine user's posts and friends' posts and sort them by timestamp
        const allPosts = userPosts.concat(friendsPosts).sort((a, b) => b.timestamp - a.timestamp); 

        // Map formatted timestamp to the posts
        const formattedPosts = allPosts.map(post => ({
            ...post._doc,
            formattedTimestamp: formatTimestamp(post.timestamp)
        }));

        // Find friends (all users)
        const users = await User.find({ _id: { $ne: req.user._id } }).sort({ name: 1 });

        // Determine if each user is a friend
        const friendsList = users.map(user => ({
            _id: user._id,
            name: user.name,
            isFriend: friendsRecord && friendsRecord.friends.some(friend => friend._id.equals(user._id))
        }));

        // Retrieve the generated text and title from the session
        const generatedText = req.session.generatedText;
        const title = req.session.title;
        // Clear the session values
        delete req.session.generatedText;
        delete req.session.title;

        // Render the profile page with posts and friends list
        res.render('profile', {
            user: req.user.name,
            posts: formattedPosts,
            friends: friendsList,
            image: req.user.profilePic,
            errorMessage: req.query.error,
            generatedText,
            title,
        });

    } catch (err) {
        logger.error(`Error fetching posts: ${err.message}`);
        res.status(500).send('Error fetching posts'); // Display error message if there's an issue fetching posts
    }
};