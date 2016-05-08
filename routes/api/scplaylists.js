var express = require('express');
var router = express.Router();
var db = require('../../client/database');

/* GET API/playlist index page. */
router.get('/', function(req, res, next) {
	res.json({ error: 'you must supply a playlist id' });
});

/* GET playlist */
router.get('/:id', function(req, res, next) {
	db.getSCPlaylist(req.params.id, function(collection, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(collection);
	});
});

module.exports = router;
