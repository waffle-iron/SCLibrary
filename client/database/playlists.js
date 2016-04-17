module.exports = function(db){

    var module = {};

    // Given a playlist name and a user id, create a playlist and assign 
    // ownership to the user.
    module.createPlaylist = function(name, uid, done){
        //TODO: Make sure playlists are not created w/ duplicate names
        db.cypher({ 
            query: "MATCH (user:Channel {scuid: {uid} }) " + 
                   "CREATE (playlist:Playlist {name: {playlist_name} })<-[r:OWNS]-(user) " +
                   "RETURN user, r, playlist",
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
            query: "MATCH (playlist:Playlist) WHERE id(playlist) = {pid} DETACH DELETE playlist",
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
            query: "MATCH (track:Track {scid: {tid} }), (playlist:Playlist) " + 
                   "WHERE id(playlist) = {pid} " +
                   "CREATE (playlist)-[r:CONTAINS]->(track) " +
                   "RETURN playlist, r, track",
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
        });
    }

    // Given a track id and a playlist id, remove any playlist contains track relationship between them.
    module.removeTrackFromPlaylist = function(tid, pid, done){
        db.cypher({ 
            query: "MATCH (Track {scid: {tid} })<-[r:CONTAINS]-(playlist:Playlist) " + 
                   "WHERE id(playlist) = 7108 " +
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
            query: "MATCH (playlist:Playlist)-[:CONTAINS]->(track:Track) " +
                   "WHERE id(playlist) = {pid}" +
                   "RETURN track",
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

    // Given a user, return the list of all playlists owned by the user.
    module.getPlaylists = function(uid, done){
        db.cypher({ 
            query: "MATCH (Channel {scuid: {scuid} })-[:OWNS]->(playlist:Playlist) " +
                   "RETURN playlist",
            params: {
                scuid: uid
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

    return module;
}