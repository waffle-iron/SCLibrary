var express = require('express');
var router = express.Router();
var db = require('../client/database');

var users = require('./api/users.js');
var playlists = require('./api/playlists.js');
var accounts = require('./api/accounts.js');
var requests = require('./api/requests.js');

var requiresAdmin = require('./middleware/requiresAdmin');

router.use('/users/', users);
router.use('/playlists/', playlists);
router.use('/accounts/', accounts);
router.use('/requests/', requiresAdmin, requests);

/* GET API index. */
router.get('/', function(req, res, next) {
	res.json({ error: 'Use endpoints /users/ /playlists/ and /scplaylists/.' });
});

module.exports = router;
