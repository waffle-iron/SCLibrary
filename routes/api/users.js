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

/* GET user's collection. */
router.get('/:id/collection', function(req, res, next) {
	// Get the collection from the database and render the json.
	db.getCollection(req.params.id, function(collection){
		res.json(collection);
	});
})

/* GET user's playlists */
router.get('/:id/playlists', function(req, res, next) {
	db.getPlaylists(req.params.id, function(playlists, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(playlists);
	});
});

/* GET user's soundcloud playlists */
router.get('/:id/scplaylists', function(req, res, next) {
	db.getSCPlaylists(req.params.id, function(playlists, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(playlists);
	});
});

/* GET user's soundcloud playlist */
router.get('/:uid/scplaylists/:pid', function(req, res, next) {
	db.getSCPlaylist(req.params.uid, req.params.pid, function(playlists, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(playlists);
	});
});

/* GET user's channels */
router.get('/:id/channels', function(req, res, next) {
	db.getChannels(req.params.id, function(channels, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(channels);
	});
});

/* GET liked tracks from a specified channel */
router.get('/:uid/channels/:cid', function(req, res, next) {
	db.getLikedTracksByChannel(req.params.uid, req.params.cid, function(tracks, error){
		if (error){
			console.log(error);
			res.json({"error":"failed"});
		}
		else{
			res.json(tracks);
		}
	});
});

module.exports = router;