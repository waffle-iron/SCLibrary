var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var ensureLoggedOut = require('../middleware/ensureLoggedOut');

/* GET login page. */
router.get('/', ensureLoggedOut, function(req, res, next) {
  res.render('login', {msg: null});
});

/* GET login/submit page. */
router.get('/submit/', ensureLoggedOut, function(req, res, next) {

  var name = req.query.name;
  var password = req.query.password;

  db.loginToAccount(name, password, function(results, error){
    if (error){
      var message = 'There was an error when trying to login to your account.';
      res.render('login', {msg: message});
    }
    if (!results.account){
      var message = 'We were not able to find that account.';
      res.render('login', {msg: message});
    }
    if (results.users.length > 0){
      console.log(results);
      req.session.account = results.account;
      if (results.account.a.properties.approved == true){
        req.session.user = results.users[0].u;
        res.redirect('/library/');
      }
      else {
        var message = 'This account has not yet been approved.';
        res.render('login', {msg: message});
      }
      
    }
  })
  
});

module.exports = router;