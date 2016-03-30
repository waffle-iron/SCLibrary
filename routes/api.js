var express = require('express');
var router = express.Router();

/* GET API index page. */
router.get('/', function(req, res, next) {
  res.json({ hello: 'world' });
});

module.exports = router;
