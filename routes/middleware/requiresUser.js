// Middleware used to guarantee that the user is logged in before processing the request.
function requiresUser(req, res, next) {
	// Check that there is no session or that there is no user in the session.
    if (!req.session || !req.session.user) {
    	// If not logged in, redirect to the home page.
        console.log("logged out");
        res.redirect('/');
    } else {
    	// User is logged in, continue processing the request.
        console.log("logged in");
        next();
    }
}

module.exports = requiresUser;
