var requestify = require('requestify');
var config = require('../config.js');

//used for get requests to soundcloud API
function getRequest(href, done){
    requestify.get(href).then(function(response){
        done(response.getBody());
    })
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
    console.log("here");

    var href = 'https://api.soundcloud.com/users/' + user.id 
        + '/favorites?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';



    // This code is asynchronous. It doesn't work. Going to keep recursion for now.
    /*
    var collection = [];
    while (collection.length < 100){
        console.log(collection.length);
        requestify.get(href).then(function(response){
            collection.push(response.getBody().collection);
            if (response.getBody().next_href)
                href = response.getBody().next_href;
            else
                href = '';
        });

    }
    done(collection);
    */
    
    getCollectionRecurse([], href, done);
}

function getCollectionRecurse(collection, next_href, done){

    console.log("recurse");
    getRequest(next_href, function(response){
        var updatedCollection = collection.concat(response.collection);
        if (next_href && updatedCollection.length < 100){ 
            var href = response.next_href;
            getCollectionRecurse(updatedCollection, href, done);
        }
        else {
            console.log("done");
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