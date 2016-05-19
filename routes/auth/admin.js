var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var ensureLoggedOut = require('../middleware/ensureLoggedOut');

/* GET admin login page. */
router.get('/', ensureLoggedOut, function(req, res, next) {
  res.render('adminlogin', {msg: null});
});

/* GET admin login/submit page. */
router.get('/submit/', ensureLoggedOut, function(req, res, next) {

  var name = req.query.name;
  var password = req.query.password;

  db.loginToAccount(name, password, function(account, error){
    if (error){
      var message = 'There was an error when trying to login to your account.';
      res.render('adminlogin', {msg: message});
    }
    if (account.length == 0){
      var message = 'We were not able to find that account.';
      res.render('adminlogin', {msg: message});
    }
    if (account.length > 0){
      req.session.account = account[0];
      console.log(account[0]);
      if (account[0].a.properties.type == 'admin'){
        res.redirect('/admin/panel/');
      }
      else {
        var message = 'This account does not belong to an administrator.';
        res.render('adminlogin', {msg: message});
      }
    }
  })
  
});


/* GET admin panel. */
router.get('/panel/', ensureLoggedOut, function(req, res, next) {
  res.render('panel', {msg: null});
});


module.exports = router;