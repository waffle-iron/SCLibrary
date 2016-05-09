var express = require('express');
var router = express.Router();
var db = require('../client/database');

var users = require('./api/users.js');
var playlists = require('./api/playlists.js');
var scplaylists = require('./api/scplaylists.js');

router.use('/users/', users);
router.use('/playlists/', playlists);
router.use('/scplaylists/', scplaylists);

/* GET API index. */
router.get('/', function(req, res, next) {
	res.json({ error: 'Use endpoints /users/ /playlists/ and /scplaylists/.' });
});

module.exports = router;
