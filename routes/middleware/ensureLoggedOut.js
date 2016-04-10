
function ensureLoggedOut(req, res, next) {
    if (req.session.user) {
        console.log("logged in");
        res.redirect('/library/');
    } else {
        console.log("logged out");
        next();
    }
}

module.exports = ensureLoggedOut;
