var express = require('express');
var router = express.Router();

var db = require('../../client/database');
var sc = require('../../client/soundcloud');

/* GET all requests. */
router.get('/', function(req, res, next) {
	db.getRequests(function(requests, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(requests);
	});
});

/* GET Approve request. */
router.get('/:id/approve', function(req, res, next) {

	db.getRequest(req.params.id, function(request, error){
		if (error)
			res.json({"error":"failed"});
		else{
			console.log(request);
			var username = request[0].r.properties.username;

			sc.getUserFromUsername(username, function(sc_user, error){
				if (error) {
					console.log(error);
					res.json(error);
				}
				
				db.addUser(sc_user, function(db_user, error){
          			if (error) {
            			console.log(error);
          			}
          			// Retrieve the user's favorites from the Soundcloud API.
      				sc.getCollection(sc_user, function(collection, error){
        				if (error){
          					console.log(error);
        				}
        				// Add the user's collection to the database.
        				db.addCollection(db_user, collection, function(error, pids){
          					if (error) {
           						console.log(error);
          					}
          					console.log("collection added");
      						sc.getPlaylists(pids, function(playlists, error){
            					console.log("got playlists");
        						db.addPlaylistTracks(playlists, function(){
              						console.log("added playlist tracks");
              						db.approveRequest(req.params.id, function(request, error){
              							if (error) {
              								console.log(error);
              							}
              							res.json(request);
              						})
            					});
          					});
        				});
      				});
        		});
			})
		}
	});
});

module.exports = router;
