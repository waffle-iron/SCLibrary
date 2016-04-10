var config = require('../config.js');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(config.neo4j_href);

function addUser(user, accessToken, done){
    // Search the database to find a match
    /*
    db.cypher({ 
        query: 'MATCH (user:Channel {name: {name}}) RETURN user',
        params: {
            name: user.username
        },
    }, function(err, results){
        if (err){
            res.json({"error":"error"});
        }
        // If no match, create an entry for the user
        if (results.length == 0) {
            console.log('User not found. Going to create user ' + user.username + '.');
            // Create an entry for the user
            */
            var query = 'CREATE (user:Channel {name: {name}, scuid: {scuid},' +
                                    'permalink: {permalink}, avatar_url: {avatar_url},' +
                                    'country: {country}, token: {token} }) RETURN user';
            db.cypher({ 
                query: query,
                params: {
                    name: user.username,
                    scuid: user.id,
                    permalink: user.permalink,
                    avatar_url: user.avatar_url,
                    country: user.country,
                    token: accessToken
                },
            }, function(err, results){
                if (err){
                    console.log(err);
                } else {
                    //console.log(results);
                    console.log("User added to database");
                    // Request the users soundcloud ID from the server
                    done();
                }
            });
            /*
        // If match found, do nothing
        } else {
            console.log("User already in database");
            done();
        }
    });
*/
}

function findUser(accessToken, done){
    console.log(accessToken);
    var query = 'MATCH (user:Channel { token: "1-232387-12073749-07655e048b589a" }) RETURN user';

    db.cypher({ 
        query: query
    }, function(err, results){
        if (err){
            console.log(err);
        }
        else {      
            console.log(results);
            // If no match, create an entry for the user
            if (results.length == 0) {
                console.log("No user found with this access token.");
                done(false, null);
                //TODO: Update access token
            }
            else {
                console.log("User was found with this access token.");
                done(true, results);
            }
        }
    });
}
/*
function findUser(user, accessToken, done){
    db.cypher({ 
        query: 'MATCH (user:Channel {name: {name}}) RETURN user',
        params: {
            name: user.username
        },
    }, function(err, results){
        if (err){
            res.json({"error":"error"});
        }
        // If no match, create an entry for the user
        if (results.length == 0) {
            console.log('User not found.');
            done(0);
        // If match found, do nothing
        } else {
            console.log("User already in database");


            db.cypher({ 
                query: 'MATCH (user:Channel {name: {name}, token: {token} }) RETURN user',
                params: {
                    name: user.username,
                    token: accessToken
                },
            }, function(err, results){
                if (err){
                    res.json({"error":"error"});
                }
                // If no match, create an entry for the user
                if (results.length == 0) {
                    console.log("Access token has changed");
                    //TODO: Update access token
                }
                else {
                    console.log("Access token is the same");
                }
                done(1);
            });

        }
    });
}
*/

function addCollection(user, collection, done){
    console.log("adding collection to database");
    addTracks(user, collection, 0, done);
}

function addTracks(user, collection, index, done){
    track = collection[index];
    if (track.kind == 'track'){
        
        checkExistence(user, track, function(found){
            //user to track relationship already exists in database; done.
            if (found){
                done();
            }
            //relationship does not yet exist; create it.
            else {
                var query = 'MATCH (user:Channel {name: {name}}) ' + 
                            'MERGE (t:Track { name: {title},' 

                if(track.genre != null)
                    query += 'genre: {genre},';
                query += 'duration: {duration}, scid: {tid}, ' +
                         'url: {url}, tag_list: {tag_list}, created_at: {created_at}, ';
                if (track.purchase_url != null)
                    query += 'purchase_url: {purchase_url}, ';
                if (track.artwork_url != null)
                    query += 'artwork_url: {artwork_url}, ';
                query = query + 'waveform_url: {waveform_url} }) ' +
                            'MERGE (c:Channel { name: {channel} }) ' + 
                            'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' + 
                            'CREATE (user)-[r1:LIKES_TRACK]->(t) ' +
                            'CREATE (c)-[r2:UPLOADED]->(t) ' +
                            'RETURN user, r1, c, r2, t';

                db.cypher({ 
                    query: query,
                    params: {
                        name: user.username,
                        title: track.title,
                        duration: track.duration,
                        genre: track.genre,
                        tid: track.id,
                        url: track.permalink_url,
                        purchase_url: track.purchase_url,
                        tag_list: track.tag_list,
                        artwork_url: track.artwork_url,
                        created_at: track.created_at,
                        waveform_url: track.waveform_url,
                        channel: track.user.username,
                        channel_url: track.user.permalink_url,
                        avatar_url: track.user.avatar_url,
                        uid: track.user.id
                    },
                }, function(err, results){
                    if (err){
                        console.log(err);
                    }
                    else {
                        console.log("Track added!");
                        index++;
                        if (index < collection.length - 1) 
                            addTracks(user, collection, index, done);
                        else
                            done();
                    }
                });

            }

        })

    } 
    else {
        console.log("attempted to add playlist");
        //TODO: Add tracks from this playlist 
        index++;
        addTracks(user, collection, index, done);
    }

}

function checkExistence(user, track, done){
    var query = 'MATCH (user:Channel {name: "' + user.username + '"}), (t:Track {scid:' 
                + track.id + '} ), (user)-[:LIKES_TRACK]->(t) return user, t';

    db.cypher({ 
        query: query
    }, function(err, results){
        if (err){
            console.log(err);
        }
        else {      
            console.log(results);
            // If no match, create an entry for the user
            if (results.length == 0) {
                console.log("No relationship found.");
                done(false);
                //TODO: Update access token
            }
            else {
                console.log("Relationship already exists.");
                done(true);
            }
        }
    });
}

function getCollection(user, done){
//MATCH (currUser:Channel { name: "miladmaaan"}),(currUser)-[:LIKES_TRACK]->(t) RETURN t;

    var query = 'MATCH (currUser:Channel { name: {name}}),(currUser)-[:LIKES_TRACK]->(t)'
                + '<-[:UPLOADED]-(c) RETURN t, c';

    db.cypher({ 
        query: query,
        params: {
            name: user.username
        },
    }, function(err, results){
        if (err){
            console.log(err);
        }
        else {
            //console.log(results);
            // No collection found for the user
            if (results.length == 0) {
                console.log("no collection found for this user");
            // If match found, do nothing
            } else {

            }
            done(results);
        }
    });
}


module.exports = {
    addUser: addUser,
    findUser: findUser,
    addCollection: addCollection,
    getCollection: getCollection
}     