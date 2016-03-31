var express = require('express');
var router = express.Router();

router.use('/users', require('./api/users'));

/* GET API index page. */
router.get('/', function(req, res, next) {
  res.json({ hello: 'world' });
});

module.exports = router;
