var express = require('express');
var requestify = require('requestify');
//var Q = require('q');
//var soundcloud = require('../../../util/soundcloud');
var router = express.Router();

/* POST to Add User Service */

router.post('/', function(req, res) {
    var db = req.db;
    var user = req.body.user;
    console.log(req.body.user);

    // Search the database to find a match
    db.cypher({ 
        query: 'MATCH (user:Channel {name: {username}}) RETURN user',
        params: {
            username: user.username
        },
    }, function(err, results){
        if (err){
            res.json({"error":"error"});
        }
        // If no match, create an entry for the user
        if (results.length == 0) {
            console.log('User not found. Going to create user ' + user.username + '.');
            // Create an entry for the user
            var query = 'CREATE (user:Channel {username: {username}, scuid: {scuid},' +
                                    'permalink: {permalink}, avatar_url: {avatar_url},' +
                                    'country: {country}, first_name: {first_name},' +
                                    'last_name: {last_name} }) RETURN user';
            db.cypher({ 
                query: query,
                params: {
                    username: user.username,
                    scuid: user.id,
                    permalink: user.permalink,
                    avatar_url: user.avatar_url,
                    country: user.country,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
            }, function(err, results){
                if (err){
                    res.json({"error":"error"});
                } else {
                    console.log("User added to database");
                    // Request the users soundcloud ID from the server
                    res.json({"success":"User added to database"});
                }
            });
        // If match found, do nothing
        } else {
            console.log("User already in database");
            return;
        }
    });

});

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