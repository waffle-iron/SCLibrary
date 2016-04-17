module.exports = function(db){

    var module = {};

    // Add a user to the database if they do not already exist.
    module.addUser = function(user, done){
        // Search the database to find a match
        db.cypher({ 
            query: 'MATCH (user:Channel {scuid: {scuid}}) RETURN user',
            params: {
                scuid: user.id
            },
        }, function(error, results){
            if (error){
                done(error);
            }
            // If no match, create an entry for the user
            if (results.length == 0) {
                console.log('User not found. Going to create user ' + user.username + '.');
                // Create an entry for the user
                db.cypher({ 
                    query: 'CREATE (user:Channel {name: {name}, scuid: {scuid}, permalink: {permalink}, '
                            + 'avatar_url: {avatar_url}, country: {country} }) RETURN user',
                    params: {
                        name: user.username,
                        scuid: user.id,
                        permalink: user.permalink,
                        avatar_url: user.avatar_url,
                        country: user.country
                    },
                }, function(error, results){
                    if (error){
                        done(error);
                    } else {
                        // User was added to the database.
                        done();
                    }
                });
                
            // If match found, do nothing
            } else {
                console.log("User already in database");
                done();
            }
        });
    }

    // Find a user from the database given their scuid.
    module.getUser = function(uid, done){
        console.log(uid);
        db.cypher({ 
            query: 'MATCH (user:Channel { scuid: ' + uid + ' }) RETURN user',
            params: {
                scuid: uid
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
