var express = require('express');
var router = express.Router();
var db = require('../../client/database');

/* GET all accounts. */
router.get('/', function(req, res, next) {
	db.getAccounts(function(accounts, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(accounts);
	});
});

/* GET Approve account. */
router.get('/:id/approve', function(req, res, next) {
	db.approveAccount(req.params.id, function(accounts, error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json(accounts);
	});
});

module.exports = router;
