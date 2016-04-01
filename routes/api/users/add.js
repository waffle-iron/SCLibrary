var express = require('express');
var requestify = require('requestify');
var config = require('../../../config.js');
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
                    res.render('home', {username: user.username});
                    //res.json({"success":"User added to database"});
                }
            });
        // If match found, do nothing
        } else {
            console.log("User already in database");
            res.render('home', {username: user.username});
            //return;
        }
    });

});



module.exports = router;