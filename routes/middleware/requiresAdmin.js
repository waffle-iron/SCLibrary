// Middleware used to guarantee that the logged in user is an administrator before processing the request.
function requiresAdmin(req, res, next) {
	// Check that there is no session or that there is no user in the session.
    if (!req.session || !req.session.account) {
    	// If not logged in, redirect to the home page.
        console.log("logged out");
        res.redirect('/login/');
    } else {
    	// User is logged in, continue processing the request.
        console.log("logged in");

        if (req.session.account.a.properties.type == 'admin'){
            next();
        }
        else {
            console.log("not an admin");
            res.redirect('/login/');
        }
    }
}

module.exports = requiresAdmin;
