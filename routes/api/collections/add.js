var express = require('express');
var requestify = require('requestify');
var config = require('../../../config.js');
//var Q = require('q');
//var soundcloud = require('../../../util/soundcloud');
var router = express.Router();

router.post('/', function(req, res) {
	console.log(req.session);
	var user = req.session.user;
    var href = 'https://api.soundcloud.com/users/' + user.id 
        + '/favorites?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';
	getCollection(req, res, [], href);
});


function getCollection(req, res, collection, next_href){
    console.log("here");

    requestify.get(next_href).then(function(response){
        collection = collection + response.getBody().collection;
        if (next_href){ 
            var href = response.getBody().next_href;
            getCollection(req, res, collection, href);
        }
        else {
            console.log("done");
            res.json(collection);
        }
        //res.json(response.getBody());
    });
}     

/*
function addTracks(req, res, collection, index){
    track = collection[index];
    var db = req.db;

    if (track && track.track && track.track.title){

        var scquery = 'MATCH (user:Channel {name: {username}}) ' + 
                    'MERGE (t:Track { name: {title}, genre: {genre}, duration: {duration}, scid: {tid}, ' +
                    'url: {url}, tags: {tags}, created_at: {created_at}, ';
        if (track.track.purchase_url != null)
            scquery += 'purchase_url: {purchase_url}, ';
        if (track.track.artwork_url != null)
            scquery += 'artwork_url: {artwork_url}, ';
        scquery = scquery + 'waveform_url: {waveform_url} }) ' +
                    'MERGE (c:Channel { name: {channel} }) ' + 
                    'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' + 
                    'CREATE (user)-[r1:LIKES_TRACK]->(t) ' +
                    'CREATE (c)-[r2:UPLOADED]->(t) ' +
                    'RETURN user, r1, c, r2, t';

        db.cypher({ 
            query: scquery,
            params: {
                username: req.body.username,
                title: track.track.title,
                duration: track.track.duration,
                genre: track.track.genre,
                tid: track.track.id,
                url: track.track.permalink_url,
                purchase_url: track.track.purchase_url,
                tags: track.track.tag_list,
                artwork_url: track.track.artwork_url,
                created_at: track.track.created_at,
                waveform_url: track.track.waveform_url,
                channel: track.track.user.username,
                channel_url: track.track.user.permalink_url,
                avatar_url: track.track.user.avatar_url,
                uid: track.track.user.id
            },
        }, function(err, results){
            index++;
            // console.log(index);
            // console.log(err);
            // console.log(results);
            if (index < collection.length - 1)
                addTracks(req, res, collection, index);
            else { 
                console.log("successful collection grab");
                // And forward to success page
                res.redirect("/");
            }
        });

    } else {
        index++;
        console.log("attempted to add playlist");
        if (index < collection.length - 1)
            addTracks(req, res, collection, index);
        else { 
            console.log("successful collection grab");
            // And forward to success page
            res.redirect("/");
        }
    }
}
*/


module.exports = router;