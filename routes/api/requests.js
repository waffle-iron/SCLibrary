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

module.exports = router;
