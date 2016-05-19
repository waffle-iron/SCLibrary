// Middleware used to guarantee that the user is logged out before processing the request.
function ensureLoggedOut(req, res, next) {
	// Check that the session contains a user.
    if (req.session && req.session.account) {
    	// User is logged in, redirect to library page.
        console.log("logged in");
        res.redirect('/library/');
    } else {
    	// User is logged out, continue with the request.
        console.log("logged out");
        next();
    }
}

module.exports = ensureLoggedOut;
