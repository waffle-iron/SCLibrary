var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var requiresUser = require('../middleware/requiresUser');
var ensureLoggedOut = require('../middleware/ensureLoggedOut');

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', {msg: null});
});


/* GET login/submit page. */
router.get('/submit/', function(req, res, next) {

  var name = req.query.name;
  var password = req.query.password;

  db.loginToAccount(name, password, function(account, error){
    if (error){
      var message = 'There was an error when trying to login to your account.';
      res.render('login', {msg: message});
    }
    if (account.length == 0){
      var message = 'We were not able to find your account.';
      res.render('login', {msg: message});
    }
    if (account.length > 0){
      res.redirect('/library/');
    }
  })
  
});


module.exports = router;