var express = require('express');
var router = express.Router();
var db = require('../../client/database');

/* GET API/playlist index page. */
router.get('/', function(req, res, next) {
	res.json({ error: 'you must supply a user id' });
});

/* GET user */
router.get('/:id', function(req, res, next) {
	db.getUser(req.params.id, function(user, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(user);
	});
});

/* GET user's playlists */
router.get('/:id/playlists', function(req, res, next) {
	db.getPlaylists(req.params.id, function(playlists, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(playlists);
	});
});

module.exports = router;