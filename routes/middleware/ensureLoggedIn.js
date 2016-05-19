// Middleware used to guarantee that the user is logged in before processing the request.
function ensureLoggedIn(req, res, next) {
	// Check that there is no session or that there is no account in the session.
    if (!req.session || !req.session.account) {
    	// If not logged in, redirect to the home page.
        console.log("logged out");
        res.redirect('/');
    } else {
    	// User is logged in, continue processing the request.
        console.log("logged in");
        next();
    }
}

module.exports = ensureLoggedIn;
