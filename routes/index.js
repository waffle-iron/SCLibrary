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
router.get('/', ensureLoggedOut, function(req, res, next) {
  // Use SC client to get the connect URL to use for user authentication.
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express', connect_url: connect_url });
});

/* GET home page. */
router.get('/home/', ensureLoggedOut, function(req, res, next) {
  // Save the code returned by soundcloud in the query string. This code will be used to
  // authorize our application and retrieve an access token for the user.
  var code = req.query.code;
  // Trade the code for an access token.
  req.SC.authorize(code, function(error, accessToken) {
    if ( error ) {
      console.log(error);
    } 
    else {
      // Client is now authorized and able to make API calls
      // Save the accessToken in the user's session.
      req.session.oauth_token = accessToken;
      // Retreive the user's information from the Soundcloud API.
      soundcloud.getLoggedInUser(accessToken, function(sc_user, error){
        if (error){
          console.log(error);
        }
        // Add the user to the database.
        db.addUser(sc_user, function(db_user, error){
          if (error) {
            console.log(error);
          }
          // Save the user's information in the user's session.
          req.session.user = db_user;
          // Retrieve the user's favorites from the Soundcloud API.
          soundcloud.getCollection(sc_user, function(collection, error){
            if (error){
              console.log(error);
            }
            // Add the user's collection to the database.
            db.addCollection(db_user, collection, function(error, pids){
              if (error) {
                console.log(error);
              }
              console.log("collection added");
              soundcloud.getPlaylists(pids, function(playlists, error){
                console.log("got playlists");
                db.addPlaylistTracks(playlists, function(){
                  console.log("added playlist tracks");
                  res.redirect('/library/');
                });
              });
            });
          });
        });
      });
    }
  });

});

/*GET library page. */
/*
When using a custom player must abide by these TOS:
Credit the uploader as the creator of the sound
Credit SoundCloud as the source by including one of the logos found here
Link to the SoundCloud URL containing the work
If the sound is private link to the profile of the creator
*/
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
  res.redirect('/');
})

module.exports = router;
