var express = require('express');
var router = express.Router();
var db = require('../client/database');

var users = require('./api/users.js');
var playlists = require('./api/playlists.js');

router.use('/users/', users);
router.use('/playlists/', playlists);

/* GET API index. */
router.get('/', function(req, res, next) {
	res.json({ hello: 'world' });
});

/* GET logged in user's collection. */
router.get('/mycollection/', function(req, res, next) {
	// Retrieve the user data from the session.
	var user = req.session.user;
	// Get the collection from the database and render the json.
	db.getCollection(user._id, function(collection){
		res.json(collection);
	});
})

/* GET logged in user's collection. */
router.get('/myplaylists/', function(req, res, next) {
	// Retrieve the user data from the session.
	var user = req.session.user;
	// Get the collection from the database and render the json.
	db.getPlaylists(user._id, function(playlists){
		res.json(playlists);
	});
})

module.exports = router;
