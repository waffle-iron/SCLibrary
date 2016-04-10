
function requiresUser(req, res, next) {
    if (!req.session.user) {
        console.log("no user logged in");
        //req.flash('error', "You must be logged in to continue");
        res.redirect('/');
    } else {
        console.log("logged in");
        next();
    }
}

module.exports = requiresUser;
