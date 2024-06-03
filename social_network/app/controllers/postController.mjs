/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import Post from '../models/post.mjs';
import User from '../models/user.mjs';
import Friends from '../models/friends.mjs';
import logger from '../config/logger.mjs';

export const createPost = async (req, res) => {
	const {title, caption, content} = req.body;
	try {
		// Create a new instance of the model
		const post = new Post({
			title: title,
			caption: caption,
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
		logger.error('Post Error:', errorMessage);
		// Redirect to profile page with error message if authentication fails
		res.redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
    }
}

export const getProfile = async (req, res) => {
    try {
		// Find posts by user ID and sort by timestamp
        const userPosts = await Post.find({ user: req.user._id }).sort({ timestamp: -1 }).populate('user', 'name'); //

        // Find the user's friends
        const friendsRecord = await Friends.findOne({ user: req.user._id }).populate('friends');
        
        // Initialize an array to store friends' posts
        let friendsPosts = [];

        if (friendsRecord && friendsRecord.friends.length > 0) {
            const friendsIds = friendsRecord.friends.map(friend => friend._id);

            // Find the posts of all friends
            friendsPosts = await Post.find({ user: { $in: friendsIds } }).sort({ timestamp: -1 }).populate('user', 'name');
        }

        // Combine user's posts and friends' posts and sort them by timestamp
        const allPosts = userPosts.concat(friendsPosts).sort((a, b) => b.timestamp - a.timestamp); 

        // Generate HTML to display posts
        let postListHTML = '<h1>Posts</h1>';
        if (allPosts.length === 0) {
            postListHTML += '<p>No posts available &#128546;</p>'; // Display message if no posts are available
        } else {
            postListHTML += '<ul>';
            allPosts.forEach(post => {
                postListHTML += `
                    <h2>${post.title}</h2>
                    ${post.caption ? `<p><strong>Caption:</strong> ${post.caption}</p>` : ''}
                    <p><strong>Content:</strong> ${post.content}</p>
                    <p><em>Posted by: ${post.user.name}</em></p><br>
                `; // Only display caption if not blank
            });
            postListHTML += '</ul>';
        }        
        
        // Find friends (all users)
        const users = await User.find({ _id: { $ne: req.user._id } }).sort({ username: 1 });

        // Generate HTML to display friends (all users)
        let friendsListHTML = '<h1>Friends</h1>';
        if (users.length === 0) {
            friendsListHTML += '<p>You have no friends &#128557</p>'; // Display message if no posts are available
        } else {
            friendsListHTML += '<ul>';
            for (const user of users) {
                const isFriend = await Friends.findOne({ user: req.user._id, friends: user._id }) !== null;
                if (isFriend) {
                    friendsListHTML += `
                        <strong>${user.name}</strong>&nbsp&nbsp
                        <form action="/unfriend/${user._id}" method="post">
                            <input type="submit" name="unfriend" value="unfriend" />
                        </form><br>
                    `;
                } else {
                    friendsListHTML += `
                        <strong>${user.name}</strong>&nbsp&nbsp
                        <form action="/friend/${user._id}" method="post">
                            <input type="submit" name="friend" value="friend" />
                        </form><br>
                    `;
                }
            }
            friendsListHTML += '</ul>';
        }

		// Get any error messages from the query string
		const errorMessage = req.query.error ? `<span style="color:red;">Error: ${req.query.error}</span>` : '';

        // Display the generated HTML
        res.send(`
            Hello ${req.user.name}! &#128515&nbsp&nbsp
            <a href="/logout">Logout</a>
			<br>${errorMessage}
            <form action="/post" method="post">
            	<br>Title: <input type="text" name="title">
				<br>Caption: <input type="text" name="caption">
				<br>Content: <input type="text" name="content">
				<br><button type="submit">Post</button>
            </form><br><br>
            ${friendsListHTML}<br><br>
            ${postListHTML}
        `); // Display profile, posts, and any error messages
		
    } catch (err) {
        logger.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts'); // Display error message if there's an issue fetching posts
    }
}