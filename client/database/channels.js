module.exports = function(db){

    var module = {};

    module.getChannels = function(uid, done){
        db.cypher({ 
            query: 'MATCH (u:Channel)-[:LIKES_TRACK]->(Track)<-[:UPLOADED]-(c:Channel) ' + 
                   'WHERE id(u) = {uid} ' +
                   'RETURN DISTINCT c ' +
                   'ORDER BY LOWER(c.name)' ,
            params: {
                uid: uid
            }
        }, function(error, results){
            if (error){
                done(null, error);
            }
            else {      
                // If no match, create an entry for the user
                if (results.length == 0) {
                    console.log("No user found.");
                }
                else {
                    console.log("User was found.");
                }
                done(results);
            }
        });
    }

    module.getLikedTracksByChannel = function(uid, cid, done){
        db.cypher({ 
            query: 'MATCH (u:Channel)-[:LIKES_TRACK]->(t:Track)<-[:UPLOADED]-(c:Channel) ' + 
                   'WHERE id(u) = {uid} ' +
                   'AND id(c) = {cid} ' +
                   'RETURN t, c',
            params: {
                uid: parseInt(uid),
                cid: parseInt(cid)
            }
        }, function(error, results){
            if (error){
                done(null, error);
            }
            else {      
                // If no match, create an entry for the user
                if (results.length == 0) {
                    console.log("No user found.");
                }
                else {
                    console.log("User was found.");
                }
                done(results);
            }
        });
    }



    return module;

}
