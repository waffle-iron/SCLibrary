var requestify = require('requestify');
var config = require('../config.js');

//used for get requests to soundcloud API
function getRequest(href, done){
    console.log(href);
    requestify.get(href).then(
        function(response){
            if (response)
            //console.log(response.getBody());
            done(response.getBody());
        },
        function(error){
            if (error)
            console.log(error);
        }
    );
}

//get a user's data
function getUser(uid, done){
    var href = "http://api.soundcloud.com/users/" + uid + "?client_id=" + config.auth.client_id;
    getRequest(href, done);
}

/* Get a particular resource of a user. 
*  Options include:
*     tracks, playlists, followings, followers, comments, favorites, groups, web-profiles
*/
function getUserResource(uid, resource, done){
    var href = "http://api.soundcloud.com/users/" + uid + 
         "/" + resource + "?client_id=" + config.auth.client_id;
    getRequest(href, done);
}

//get data for the user who is logged in
function getLoggedInUser(accessToken, done){
    var href = 'https://api.soundcloud.com/me?oauth_token=' + accessToken;
    getRequest(href, done);
}

//get a user's collection 
function getCollection(user, done){
    var href = 'https://api.soundcloud.com/users/' + user.id 
        + '/favorites?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';
    getCollectionRecurse([], href, done);
}

function getCollectionRecurse(collection, next_href, done){
    getRequest(next_href, function(response){
        var updatedCollection = collection.concat(response.collection);
        if (next_href && updatedCollection.length < 100){ 
            var href = response.next_href;
            getCollectionRecurse(updatedCollection, href, done);
        }
        else {
            console.log("done grabbing collection");
            done(updatedCollection);
        }
    });
}

function getTrack(tid, done){
    var href = "http://api.soundcloud.com/tracks/" + tid + "?client_id=" + config.auth.client_id;
    getRequest(href, done);
}

function getPlaylist(pid, done){
    var href = "http://api.soundcloud.com/playlists/" + pid + "?client_id=" + config.auth.client_id;
    getRequest(href, done);
}

module.exports = {
    getRequest: getRequest,
	getCollection: getCollection,
    getLoggedInUser: getLoggedInUser,
    getUser: getUser,
    getUserResource: getUserResource,
    getTrack: getTrack,
    getPlaylist: getPlaylist
}     