var db = require('../../client/database').instance;

var checkDBStatus = function(req, res, next){
    db.cypher({ 
        query: 'MATCH (user:Channel) RETURN user'
    }, function(error, results){
        if (error){
            res.json({"error":"the database is off"});
        }
        else {
            next();
        }
    });
}

module.exports = checkDBStatus;