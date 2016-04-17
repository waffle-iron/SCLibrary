module.exports = function(db){


    var module = {};

    // Given a collection of tracks and a user, create [:LIKES] relationships
    // between each track and the user if they do not already exist, while adding
    // tracks to the database that do not yet exist.
    module.addCollection = function(user, collection, done){
        console.log("adding collection to database");
        addTracks(user, collection, 0, done);
    };

    // Recursive helper function for addCollection.
    function addTracks(user, collection, index, done){
        track = collection[index];
        if (track.kind == 'track'){
            
            module.checkExistence(user, track, function(found, error){
                if (error)
                    done(error);
                //user to track relationship already exists in database; done.
                if (found) 
                    done();
                //otherwise relationship does not yet exist; create it.
                else {
                    var query = 'MATCH (u:Channel {name: {name}}) ' + 
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
                                'CREATE (u)-[r1:LIKES_TRACK]->(t) ' +
                                'CREATE (c)-[r2:UPLOADED]->(t) ' +
                                'RETURN u, r1, c, r2, t';

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
                    }, function(error, results){
                        if (error){
                            done(error);
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
            if (index < collection.length - 1) 
                addTracks(user, collection, index, done);
            else
                done();
        }
    }


    // Check for the existence of a [:LIKES] relationship between a channel and a track. 
    // Return true if it exists, false if it does not. 
    module.checkExistence = function(user, track, done){

        db.cypher({ 
            query: 'MATCH (u:Channel {scuid: {scuid} }), (t:Track {scid: {scid} } ), (u)-[:LIKES_TRACK]->(t) return u, t',
            params: {
                scuid: user.id,
                scid: track.id
            },

        }, function(error, results){
            if (error){
                done(null, error);
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
    };

    // Given a user, find and return their entire collection of songs, along with the channels
    // that uploaded them.
    module.getCollection = function(uid, done){
        db.cypher({ 
            query: 'MATCH (u:Channel { scuid: {scuid}}),(u)-[:LIKES_TRACK]->(t)'
                    + '<-[:UPLOADED]-(c) RETURN t, c',
            params: {
                scuid: uid
            },
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
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
    };
    return module;
}
