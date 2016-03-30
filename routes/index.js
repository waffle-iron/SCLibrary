var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express',
  						connect_url: connect_url });
});

/* GET home page. */
router.get('/home/', function(req, res, next) {
  res.render('home');
});

module.exports = router;
