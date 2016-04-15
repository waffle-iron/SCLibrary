var express = require('express');
var router = express.Router();
var db = require('../client/database');

var playlist = require('./api/playlist.js');

router.use('/playlist/', playlist);

/* GET API index. */
router.get('/', function(req, res, next) {
	res.json({ hello: 'world' });
});

/* GET logged in user's collection. */
router.get('/mycollection/', function(req, res, next) {
	// Retrieve the user data from the session.
	var user = req.session.user;
	// Get the collection from the database and render the json.
	db.getCollection(user, function(collection){
		res.json(collection);
	});
})

module.exports = router;
