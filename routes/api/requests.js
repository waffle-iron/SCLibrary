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
router.post('/:id/approve', function(req, res, next) {
	var aid = req.body.aid;
	var rid = req.params.id;

	db.getRequest(rid, function(request, error){
		if (error)
			res.json(error);
		else{
			console.log(request);
			var username = request[0].r.properties.username;

			sc.getUserFromUsername(username, function(sc_user, error){
				if (error) {
					res.json(error);
				}
				db.addUser(sc_user, function(db_user, error){
          			if (error) {
            			res.json(error);
          			}
          			// Retrieve the user's favorites from the Soundcloud API.
      				sc.getCollection(sc_user, function(collection, error){
        				if (error){
          					res.json(error);
        				}
        				// Add the user's collection to the database.
        				db.addCollection(db_user, collection, function(error, pids){
          					if (error) {
           						res.json(error);
          					}
      						sc.getPlaylists(pids, function(playlists, error){
      							if (error) {
	           						res.json(error);
	          					}
        						db.addPlaylistTracks(playlists, function(complete, error){
	      							if (error) {
	           							res.json(error);
          							}
              						var uid = db_user._id;
              						db.approveRequest(aid, rid, uid, function(request, error){
              							if (error) {
              								res.json(error);
              							}
              							else {
              								res.json(request);
              							}
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
