/* database.js
 * A client used to interface with the neo4j database to retrieve and store information.
 */

var config = require('../config.js');
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(config.neo4j_href);

var users = require('./database/users.js')(db);
var collections = require('./database/collections.js')(db);
var playlists = require('./database/playlists.js')(db);
var channels = require('./database/channels.js')(db);
var accounts = require('./database/accounts.js')(db);
var tracks = require('./database/tracks.js')(db);

module.exports = {
  instance: db,
  addUser: users.addUser,
  getUser: users.getUser,
  getUserByScuid: users.getUserByScuid,
  getChannels: channels.getChannels,
  getLikedTracksByChannel: channels.getLikedTracksByChannel,
  addCollection: collections.addCollection,
  getCollection: collections.getCollection,
  checkExistence: collections.checkExistence,
  addPlaylistTracks: collections.addPlaylistTracks,
  createPlaylist: playlists.createPlaylist,
  deletePlaylist: playlists.deletePlaylist,
  getPlaylist: playlists.getPlaylist,
  getPlaylists: playlists.getPlaylists,
  getSCPlaylist: playlists.getSCPlaylist,
  getSCPlaylists: playlists.getSCPlaylists,
  addTrackToPlaylist: playlists.addTrackToPlaylist,
  removeTrackFromPlaylist: playlists.removeTrackFromPlaylist,
  createAccount: accounts.create,
  loginToAccount: accounts.login,
  getAccounts: accounts.getAccounts,
  getRequests: accounts.getRequests,
  getRequest: accounts.getRequest,
  approveAccount: accounts.approveAccount,
  denyAccount: accounts.denyAccount,
  approveRequest: accounts.approveRequest,
  getConnectedChannels: accounts.getConnectedChannels,
  getTrack: tracks.getTrack,
  rateTrack: tracks.rateTrack,
  incPlayCount: tracks.incPlayCount,
  toggleDLStatus: tracks.toggleDLStatus
}
