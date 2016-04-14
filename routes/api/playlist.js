var express = require('express');
var router = express.Router();
var db = require('../../client/database');

/* GET API/playlist index page. */
router.get('/', function(req, res, next) {
	res.json({ error: 'no id' });
});

/* GET playlist */
router.get('/:id', function(req, res, next) {
	db.getPlaylist(req.params.id, function(collection){
		res.json(collection);
	});
});

/* POST new playlist */
router.post('/', function(req, res, next){
	db.createPlaylist(req.body.name, req.body.uid, function(){
		res.json();
	});
});

/* DELETE playlist */
router.post('/:id', function(req, res, next){
	db.deletePlaylist(req.params.id, function(){
		res.json();
	});
});

/* POST track to playlist */
router.post('/:pid/add/:tid', function(req, res, next){
	db.addTrackToPlaylist(req.params.tid, req.params.pid, function(){
		res.json();
	});
});

/* DELETE track frpm playlist */
router.post('/:pid/remove/:tid', function(req, res, next){
	db.addTrackToPlaylist(req.params.tid, req.params.pid, function(){
		res.json();
	});
});


module.exports = router;
