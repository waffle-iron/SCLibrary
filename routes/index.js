var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../config.js');
var soundcloud = require('../client/soundcloud');
var db = require('../client/database');
var Q = require('q');

var ensureLoggedIn = require('./middleware/ensureLoggedIn');
var ensureLoggedOut = require('./middleware/ensureLoggedOut');

var signup = require('./auth/signup');
var login = require('./auth/login');
var admin = require('./auth/admin');

router.use('/login/', login);
router.use('/signup/', signup);
router.use('/admin/', admin);

/* GET index page. */
router.get('/', ensureLoggedOut, ensureLoggedIn);

/*GET library page. */
router.get('/library/', ensureLoggedIn, function(req, res, next) {
  // Retrieve the user from the session.
  var user = req.session.user;
  // Render the library page.
  res.render('library', { user: user, client_id: config.auth.client_id});
});

/*GET logout page. */
router.get('/logout/', ensureLoggedIn, function(req, res, next){
  // Destroy the session.
  req.session.destroy(function(err){
    console.log(err);
  })
  // Redirect to the home page.
  res.redirect('/login/');
})

module.exports = router;
