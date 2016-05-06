module.exports = function(db){

    var module = {};

    // Given a playlist name and a user id, create a playlist and assign 
    // ownership to the user.
    module.createPlaylist = function(name, uid, done){
        //TODO: Make sure playlists are not created w/ duplicate names
        db.cypher({ 
            query: "MATCH (u:Channel {scuid: {uid} }) " + 
                   "CREATE (p:Playlist {name: {playlist_name} })<-[r:OWNS]-(u) " +
                   "RETURN u, r, p",
            params: {
                playlist_name: name,
                uid: uid
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(error);
            }
            else {      
                console.log(results);
                done();
            }
        });
    }

    // Given a playlist id, remove that playlist from the database.
    module.deletePlaylist = function(pid, done){
        db.cypher({ 
            query: "MATCH (p:Playlist) WHERE id(p) = " + pid + " DETACH DELETE p",
            params: {
                pid: pid
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(error);
            }
            else {      
                console.log(results);
                done();
            }
        });    
    }

    // Given a track id and a playlist id, create a playlist contains track relationship.
    module.addTrackToPlaylist = function(tid, pid, done){
        db.cypher({ 
            query: "MATCH (t:Track), (p:Playlist) " + 
                   "WHERE id(p) = {pid} " +
                   "AND id(t) = {tid} " +
                   "CREATE UNIQUE (p)-[r:CONTAINS]->(t) " +
                   "RETURN p, r, t",
            params: {
                tid: parseInt(tid),
                pid: parseInt(pid)
            }
        }, function(error, results){
            if (error){
                console.log("hi");
                console.log(error);
                done(error);
            }
            else {      
                console.log(results);
                done();
            }
        });
    }

    // Given a track id and a playlist id, remove any playlist contains track relationship between them.
    module.removeTrackFromPlaylist = function(tid, pid, done){
        db.cypher({ 
            query: "MATCH (Track {scid: {tid} })<-[r:CONTAINS]-(p:Playlist) " + 
                   "WHERE id(p) = 7108 " +
                   "DELETE r",
            params: {
                tid: tid,
                pid: pid
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(error);
            }
            else {      
                console.log(results);
                done();
            }
        });}

    // Given a playlist id, return the list of all tracks contained by the playlist.
    module.getPlaylist = function(pid, done){
        db.cypher({ 
            query: "MATCH (p:Playlist)-[:CONTAINS]->(t:Track)<-[:UPLOADED]-(c)  " +
                   "WHERE id(p) = " + pid + " " + 
                   "RETURN t, c",
            params: {
                id: pid
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(error);
            }
            else {      
                console.log(results);
                done(results);
            }
        });
    }

    // Given a user, return the list of all playlists owned by the user.
    module.getPlaylists = function(uid, done){
        db.cypher({ 
            query: "MATCH (Channel {scuid: {scuid} })-[:OWNS]->(p:Playlist) " +
                   "RETURN p",
            params: {
                scuid: uid
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(error);
            }
            else {      
                console.log(results[0].p.properties);
                done(results);
            }
        });
    }

    return module;
}