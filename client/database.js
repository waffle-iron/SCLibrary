/* database.js
 * A client used to interface with the neo4j database to retrieve and store information.
 */

var config = require('../config.js');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(config.neo4j_href);

var users = require('./database/users.js')(db);
var collections = require('./database/collections.js')(db);
var playlists = require('./database/playlists.js')(db);

module.exports = {
    instance: db,
    addUser: users.addUser,
    getUser: users.getUser,
    addCollection: collections.addCollection,
    getCollection: collections.getCollection,
    checkExistence: collections.checkExistence,
    addPlaylistTracks: collections.addPlaylistTracks,
    createPlaylist: playlists.createPlaylist,
    deletePlaylist: playlists.deletePlaylist,
    getPlaylist: playlists.getPlaylist,
    getPlaylists: playlists.getPlaylists,
    addTrackToPlaylist: playlists.addTrackToPlaylist,
    removeTrackFromPlaylist: playlists.removeTrackFromPlaylist
}     