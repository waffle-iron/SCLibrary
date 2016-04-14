var config = require('../config.js');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(config.neo4j_href);

function addUser(user, done){
    // Search the database to find a match
    
    db.cypher({ 
        query: 'MATCH (user:Channel {scuid: {scuid}}) RETURN user',
        params: {
            scuid: user.id
        },
    }, function(err, results){
        if (err){
            res.json({"error":"error"});
        }
        // If no match, create an entry for the user
        if (results.length == 0) {
            console.log('User not found. Going to create user ' + user.username + '.');
            // Create an entry for the user
            
            var query = 'CREATE (user:Channel {name: {name}, scuid: {scuid},' +
                                    'permalink: {permalink}, avatar_url: {avatar_url},' +
                                    'country: {country} }) RETURN user';
            db.cypher({ 
                query: query,
                params: {
                    name: user.username,
                    scuid: user.id,
                    permalink: user.permalink,
                    avatar_url: user.avatar_url,
                    country: user.country
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
            
        // If match found, do nothing
        } else {
            console.log("User already in database");
            done();
        }
    });
}

function findUser(user, done){

    db.cypher({ 
        query: 'MATCH (user:Channel { scuid: {scuid} }) RETURN user',
        params: {
            scuid: user.id
        },
    }, function(err, results){
        if (err){
            console.log(err);
        }
        else {      
            // If no match, create an entry for the user
            if (results.length == 0) {
                console.log("No user found.");
                done(false, null);
                //TODO: Update access token
            }
            else {
                console.log("User was found.");
                done(true, results);
            }
        }
    });
}

function addCollection(user, collection, done){
    console.log("adding collection to database");
    addTracks(user, collection, 0, done);
}

function addTracks(user, collection, index, done){
    track = collection[index];
    if (track.kind == 'track'){
        
        checkExistence(user, track, function(found){
            //user to track relationship already exists in database; done.
            if (found) done();
            //otherwise relationship does not yet exist; create it.
            else {
                var query = 'MATCH (user:Channel {name: {name}}) ' + 
                            'MERGE (t:Track { name: {title}, duration: {duration}, scid: {tid}, ' +
                            'url: {url}, tag_list: {tag_list}, created_at: {created_at}, ';
                if(track.genre != null)
                    query += 'genre: {genre}, ';
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

    db.cypher({ 
        query: 'MATCH (user:Channel {scuid: {scuid} }), (t:Track {scid: {scid} } ), (user)-[:LIKES_TRACK]->(t) return user, t',
        params: {
            scuid: user.id,
            scid: track.id
        },

    }, function(err, results){
        if (err){
            console.log(err);
        }
        else {      
            //console.log(results);
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

    db.cypher({ 
        query: 'MATCH (currUser:Channel { scuid: {scuid}}),(currUser)-[:LIKES_TRACK]->(t)'
                + '<-[:UPLOADED]-(c) RETURN t, c',
        params: {
            scuid: user.id
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
    getCollection: getCollection,
    checkExistence: checkExistence
}     