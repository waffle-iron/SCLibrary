var express = require('express');
var router = express.Router();
var db = require('../client/database');

var playlist = require('./api/playlist.js');

router.use('/playlist/', playlist);

/* GET API index page. */
router.get('/', function(req, res, next) {
	res.json({ hello: 'world' });
});

router.get('/mycollection/', function(req, res, next) {
	var user = req.session.user;
	db.getCollection(user, function(collection){
		res.json(collection);
	});
})

module.exports = router;
