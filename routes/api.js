var express = require('express');
var router = express.Router();
var db = require('../client/database');
var request = require('request');

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

router.get('/track/waveform/:id', function(req, res, next) {
	db.getTrack(req.params.id, function(track, error){
		if (error)
			res.json({"error":"failed"});
		else{
		    var options = {
		        url: track[0].n.properties.waveform_url,
		        method: 'GET'
		    }
		    request(options, function(error, message, object){
		        if (error){
		            res.json({"error":"failed"});
		        }
		        else {
		            var json = JSON.parse(object);
		            res.json(json.samples);
		        }
		    })

		}
	});
});

module.exports = router;
