var express = require('express');
var router = express.Router();

router.use('/users', require('./api/users'));
router.use('/collections', require('./api/collections'));

/* GET API index page. */
router.get('/', function(req, res, next) {
  res.json({ hello: 'world' });
});

module.exports = router;
