var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../config.js');
var soundcloud = require('../client/soundcloud');
var db = require('../client/database');
var Q = require('q');

var requiresUser = require('./middleware/requiresUser');
var ensureLoggedOut = require('./middleware/ensureLoggedOut');

/* GET index page. */
router.get('/', ensureLoggedOut, function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express', connect_url: connect_url });
});

/*GET player page. */
/*
When using a custom player must abide by these TOS:
Credit the uploader as the creator of the sound
Credit SoundCloud as the source by including one of the logos found here
Link to the SoundCloud URL containing the work
If the sound is private link to the profile of the creator
*/
router.get('/player/', requiresUser, function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  var accessToken = req.session.oauth_token;
  res.render('player', { token: accessToken, test: "ateststringtojsfile", client_id: config.auth.client_id});
});


/* GET home page. */
router.get('/home/', ensureLoggedOut, function(req, res, next) {

  var code = req.query.code;
  console.log("acquired code from SC");

  req.SC.authorize(code, function(err, accessToken) {
    if ( err ) {
      throw err;
    } else {
      console.log("traded code for access token");
      req.session.oauth_token = accessToken;
      // Client is now authorized and able to make API calls
      //res.render('home', { token: accessToken });
      db.findUser(accessToken, function(found, user){
        var deferred = Q.defer();
        //found user based on access token
        if (found){
          deferred.resolve(user);
        }
        //could not find user based on access token; must request from SC
        else {
          soundcloud.getLoggedInUser(accessToken, function(user){
            console.log("done getting user from SC");

            db.addUser(user, accessToken, function(){
              console.log("done adding user");

              deferred.resolve(user);

            });
          });
        }

        deferred.promise.done(function(user){
          req.session.user = user;
          soundcloud.getCollection(user, function(collection){
            console.log("done getting collection from SC");

            db.addCollection(user, collection, function(){
              console.log("done adding collection");
              res.redirect('/library/');
            });
          });
        })
      })
    }
  });

});

router.get('/library/', requiresUser, function(req, res, next) {
  var user = req.session.user;
  res.render('library', { user: user });

});

router.get('/logout/', requiresUser, function(req, res, next){
  req.session.destroy(function(err){
    console.log(err);
  })
  res.redirect('/');
})

module.exports = router;
