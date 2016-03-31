var express = require('express');
var router = express.Router();
var requestify = require('requestify');

/* GET index page. */
router.get('/', function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express',
  						connect_url: connect_url });
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
      var url = 'https://api.soundcloud.com/me?oauth_token=' + accessToken;
      requestify.get(url).then(function(response){
        res.json(response.getBody());
      });
    }
  });

});


/* GET home page. */
router.get('/token/', function(req, res, next) {

  res.render('token', { token: req.session.oauth_token });

});

module.exports = router;
