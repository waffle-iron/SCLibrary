var requestify = require('requestify');
var config = require('../config.js');

function getUser(accessToken, done){
    var href = 'https://api.soundcloud.com/me?oauth_token=' + accessToken;
    requestify.get(href).then(function(response){
        done(response.getBody());
    });
}

function getCollection(user, done){
    console.log("here");

    var href = 'https://api.soundcloud.com/users/' + user.id 
        + '/favorites?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';

    getCollectionRecurse([], href, done);
}

function getCollectionRecurse(collection, next_href, done){

    console.log("recurse");
    requestify.get(next_href).then(function(response){
        var updatedCollection = collection.concat(response.getBody().collection);
        if (next_href && updatedCollection.length < 400){ 
            var href = response.getBody().next_href;
            getCollectionRecurse(updatedCollection, href, done);
        }
        else {
            console.log("done");
            done(updatedCollection);
        }
    });
}

module.exports = {
	getCollection: getCollection,
    getUser: getUser
}     