var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../config.js');
var soundcloud = require('../client/soundcloud');

/* GET index page. */
router.get('/', function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express', connect_url: connect_url });
});

/* GET home page. */
router.get('/home/', function(req, res, next) {

  var code = req.query.code;

  req.SC.authorize(code, function(err, accessToken) {
    if ( err ) {
      throw err;
    } else {
      req.session.oauth_token = accessToken;
      // Client is now authorized and able to make API calls
      //res.render('home', { token: accessToken });
      soundcloud.getUser(accessToken, function(user){
        req.session.user = user;
        var user_url = config.base_url + '/api/users/add';
        var options = { user: user };
        requestify.post(user_url, options).then(function(response){
          console.log("done with users/add")

          soundcloud.getCollection(user, function(collection){
            console.log("suh dude");
            //console.log(collection);
            res.json(collection);
            //return collection;
          });
          /*
          var collection_url = config.base_url + '/api/collections/add';
          requestify.post(collection_url, options).then(function(response){
            console.log("done with collections/add")
            res.json(response);
          })
          */
        });
      })
    }
  });

});


/* GET home page. */
router.get('/token/', function(req, res, next) {

  res.render('token', { token: req.session.oauth_token });

});

module.exports = router;
