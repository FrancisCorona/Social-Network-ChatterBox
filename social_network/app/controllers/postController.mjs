/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

import Post from '../models/post.mjs';
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
        const posts = await Post.find({ user: req.user._id }).sort({ timestamp: -1 }).populate('user', 'username');

        // Generate HTML to display posts
        let postListHTML = '<h1>Posts</h1>';
        if (posts.length === 0) {
            postListHTML += '<p>No posts available &#128546</p>'; // Display message if no posts are available
        } else {
            postListHTML += '<ul>';
            posts.forEach(post => {
                postListHTML += `
                        <h2>${post.title}</h2>
                        ${post.caption ? `<p><strong>Caption:</strong> ${post.caption}</p>` : ''}
                        <p><strong>Content:</strong> ${post.content}</p><br>
                `; // Only display caption if not blank
            });
            postListHTML += '</ul>';
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
            ${postListHTML}
        `); // Display profile, posts, and any error messages
		
    } catch (err) {
        logger.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts'); // Display error message if there's an issue fetching posts
    }
}