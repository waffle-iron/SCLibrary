var express = require('express');
var router = express.Router();

/* GET users. */
router.get('/', function(req, res) {
	res.json({hi:"there"});
});

//router.use('/add', require('./collections/add'));
//router.use('/update', require('./collections/update'));

module.exports = router;