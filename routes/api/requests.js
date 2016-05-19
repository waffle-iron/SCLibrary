var express = require('express');
var router = express.Router();
var db = require('../../client/database');

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
	console.log(req.params.id);
	db.approveRequest(req.params.id, function(accounts, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(accounts);
	});
});

module.exports = router;
