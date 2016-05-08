var requestify = require('requestify');
var config = require('../config.js');

var database = require('./database.js');

//used for get requests to soundcloud API
function getRequest(href, done){
    //console.log(href);
    requestify.get(href).then(
        function(response){
            if (response)
            //console.log(response.getBody());
            done(response.getBody());
        },
        function(error){
            if (error)
                done(null, error);
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

    // var href = 'https://api.soundcloud.com/users/' + user.id 
    //     + '/favorites?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';

    //TODO: Use this API url (gives more results, and includes playlists)
    var href = 'https://api-v2.soundcloud.com/users/' + user.id 
        + '/likes?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';


    getCollectionRecurse(user, [], href, done);
}

function getCollectionRecurse(user, collection, next_href, done){
    console.log("here");
        console.log(next_href);
    getRequest(next_href, function(response){
        var updatedCollection = collection.concat(response.collection);
        if (response.next_href && collection.length < 500){ 
            var href = response.next_href + '&client_id=' + config.auth.client_id;
            database.checkExistence(user.id, response.collection[0], function(found, error){
                if (error)
                    done(null, error);
                if (found)
                    done(updatedCollection);
                else
                    getCollectionRecurse(user, updatedCollection, href, done);
            });
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