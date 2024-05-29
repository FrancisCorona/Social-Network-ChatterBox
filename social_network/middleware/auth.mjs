// Middleware to check authentication
function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next(); // User is authenticated, proceed to the next middleware
	}
	res.redirect('/login'); // User is not authenticated, redirect to login
}

export default isAuthenticated;