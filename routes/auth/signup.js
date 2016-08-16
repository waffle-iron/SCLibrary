var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var ensureLoggedOut = require('../middleware/ensureLoggedOut');

/* GET signup page. */
router.get('/', ensureLoggedOut, function(req, res, next) {
  res.render('signup', {
    msg: null
  });
});

/* GET signup/submit page. */
router.post('/submit', ensureLoggedOut, function(req, res, next) {
  var name = req.body.name;
  var password = req.body.password;
  var sc_account = req.body.sc_account;

  db.createAccount(name, password, sc_account, function(created, error) {
    if (error) {
      var message = 'There was an error when trying to create your account.';
    } else if (!created) {
      var message = 'An account already exists with that name.';
    } else if (created) {
      var message = 'Your account was requested.';
    }
    res.render('signup', {
      msg: message
    });
  })
});


module.exports = router;
