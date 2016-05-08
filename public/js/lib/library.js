var autoqueue = [];
var queue = [];
var backqueue = [];

var app = angular.module("Library", []);


// HTTP loader for API requests
app.factory("httpLoader", ["$http", function ($http) {
    function load(href, done) {
        $http.get(href)
            .success(function(data, status, headers, config){
                done(null, data);
            })
            .error(function(data, status, headers, config){
                console.log(status);
                var err = new Error(data);
                err.code = status;
                done(err);
            });
    }
    return {
        load: load
    };
}]);

app.controller("LibraryCtlr", function($scope){

    $scope.context = 'songs';

    // Send a song to the player and save the next 20 songs for an autoplay queue
    $scope.playSong = function(track, element){

        var b_element = element;

        autoqueue = [];
        var i = 0;
        while (element.$$nextSibling && i < 20){
            var t = element.$$nextSibling.track;
            autoqueue.push(t);
            element = element.$$nextSibling;
            i++;
        }

        backqueue = [];
        var j = 0;
        while (b_element.$$prevSibling && j < 20){
            var t = b_element.$$prevSibling.track;
            backqueue.push(t);
            b_element = b_element.$$prevSibling;
            j++;
        }

        var properties = track.t.properties;
        loadSong(properties.scid, properties.duration, properties.artwork_url, properties.waveform_url);
    }

    $scope.nextSong = function(){
        var track = queue.shift();
        backqueue.enshift(track);
        var properties = track.t.properties;
        loadSong(properties.scid, properties.duration, properties.artwork_url, properties.waveform_url);
    }

    $scope.previousSong = function(){
        var track = backqueue.shift();
        queue.enshift(track);
        var properties = track.t.properties;
        loadSong(properties.scid, properties.duration, properties.artwork_url, properties.waveform_url);
    }

});


// Library directive - html Element
app.directive("library", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/library.html',
        scope: false,
        link: function(scope, element, attr) {

            $('.playlistForm').hide();
            $('.addPlaylist').click(function(){
                $('.playlistForm').show();
            });

        },
        controller: ["httpLoader", "$q", '$http', '$timeout', '$scope', function (httpLoader, $q, $http, $timeout, $scope) {
            var ctlr = this;

            // Variables used for sort and search functionality
            ctlr.sortType = '';
            ctlr.sortReverse = false;
            ctlr.searchTerm = '';

            // Update sort variables
            ctlr.updateSort = function(sortBy){
                if (ctlr.sortType == sortBy)
                    ctlr.sortReverse = !ctlr.sortReverse; 
                else
                    ctlr.sortReverse = false;
                ctlr.sortType = sortBy;
            }

            // Convert time from ms to MM:SS
            ctlr.convertTime = function(time){
                var min_sec = time / 1000 / 60;
                var minutes = Math.floor(min_sec);
                var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
                return minutes + ":" + seconds;
            }

            // Format date string
            ctlr.formatDate = function(date){
                return date.substring(0, 10);
            }

            // Format playlist name string
            ctlr.formatName = function(name){
                if (name.length > 26)
                    return (name.substring(0,26).trim() + "...");
                else
                    return name;
            }


            // Add a playlist to the database and hide the new playlist form
            ctlr.createPlaylist = function(){
                console.log("[func] createPlaylist");
                console.log(loggedinuser);
                var url = 'http://localhost:3000/api/playlists/';
                var data = {
                    name: ctlr.playlistInput,
                    uid: loggedinuser._id
                }
                $http.post(url, data).then(function(response){
                    console.log(response);
                    ctlr.loadPlaylists();
                }, function(error){
                    console.log(error);
                }); 

                $('.playlistForm').hide();
                ctlr.playlistInput = '';
            }


            // Update the view with tracks from the selected playlist.
            ctlr.loadPlaylist = function(playlist){
                console.log("[func] loadPlaylist");
                var url = 'http://localhost:3000/api/playlists/' + playlist.p._id;
                httpLoader.load(url, function(err, result){
                    if (err)
                        console.log(err);
                    else {
                        ctlr.display = result;
                        $scope.context = 'playlists';
                        ctlr.currPlaylist = playlist.p._id;
                        ctlr.buildDeleteFromPlaylistMenu(playlist);
                    }
                })
            }

            // Delete playlist with permission from the user.
            ctlr.deletePlaylist = function(playlist){
                console.log("[func] deletePlaylist");
                if (confirm("Are you sure you want to delete?") == true){
                    var id = playlist.p._id;
                    var url = 'http://localhost:3000/api/playlists/' + id;
                    $http.delete(url).then(function(response){
                        console.log(response);
                        if (ctlr.currPlaylist == id){
                            ctlr.displaySongs();
                        }
                        ctlr.loadPlaylists();
                    }, function(error){
                        console.log(error);
                    })
                }
                else {

                }
            }

            // Update the view with tracks from the selected playlist.
            ctlr.loadSCPlaylist = function(playlist){
                console.log(playlist);
                console.log("[func] loadPlaylist");
                var url = 'http://localhost:3000/api/scplaylists/' + playlist.p._id;
                httpLoader.load(url, function(err, result){
                    if (err)
                        console.log(err);
                    else {
                        ctlr.display = result;
                        $scope.context = 'scplaylists';
                    }
                })
            }

            // Update the view with the user's collection
            ctlr.displaySongs = function(){
                console.log("[func] displaySongs");
                ctlr.display = ctlr.collection;
                $scope.context = 'songs';
                ctlr.currPlaylist = null;
            }

            ctlr.displayQueue = function(){
                console.log("[func] displayQueue");
                ctlr.display = queue;
                $scope.context = 'queue';
                ctlr.currPlaylist = null;
            }

            // Populate the list of songs
            ctlr.loadLibrary = function(){
                console.log("[func] loadLibrary");
                httpLoader.load('http://localhost:3000/api/mycollection', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ctlr.collection = result;
                        ctlr.displaySongs();
                    }
                });
            }

            // Populate the list of playlists
            ctlr.loadPlaylists = function(){
                console.log("[func] loadPlaylists");
                httpLoader.load('http://localhost:3000/api/myplaylists', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ctlr.playlists = result;
                        ctlr.buildAddToPlaylistMenu(result);
                        ctlr.updateMenu();
                    }
                });
            }

            // Populate the list of playlists
            ctlr.loadSCPlaylists = function(){
                console.log("[func] loadPlaylists");
                httpLoader.load('http://localhost:3000/api/myscplaylists', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(result);
                        ctlr.scplaylists = result;
                    }
                });
            }
            
            // Draggable handles for the columns
            ctlr.colSizeable = attachColHandles();
            ctlr.playNext = nextListener();
            ctlr.loadLibrary();
            ctlr.loadPlaylists();
            ctlr.loadSCPlaylists();

            ctlr.updateMenu = function(){
                //console.log("[func] updateMenu");

                //Destroy the current context menu
                $.contextMenu( 'destroy' );

                //These options belong in every context
                var items = {
                    add_playlist: {
                        name: "Add to playlist...",
                        items: ctlr.playlist_menu
                    }
                };

                //Include delete_playlist option when in a playlist
                if ($scope.context == 'playlists'){
                    items.delete_playlist = {
                            name: "Delete from playlist",
                            callback: ctlr.delete_func
                        };
                }

                //Include delete_queue when in a queue, add_queue when not inside a queue
                if ($scope.context == 'queue'){
                    items.delete_queue = {
                            name: "Delete from queue",
                            callback: function(key, opt){
                                var track = JSON.parse(opt.$trigger[0].dataset.track);
                                var i = 0;
                                for (i = 0; i < queue.length; i++){
                                    if (track.t._id == queue[i].t._id){
                                        queue.splice(i, 1);
                                        ctlr.display = queue.splice(i, 1);
                                        break;
                                    }
                                }

                            }
                        };
                }
                else {
                    items.add_queue = {
                        name: "Add to Queue",
                        callback: function(key, opt){
                            var track = JSON.parse(opt.$trigger[0].dataset.track);
                            queue.push(track);
                        }
                    }
                }

                //Create the context menu
                $.contextMenu({
                    selector: '.track-row',
                    items: items,
                    reposition: true,
                    autoHide: true,
                    determinePosition: function($menu){
                      // Position using jQuery.ui.position
                      // http://api.jqueryui.com/position/
                      $menu.css('display', 'block')
                          .position({ my: "right bottom", at: "left top", of: this, collision: "fit"});
                    },
                });

            }

            ctlr.buildAddToPlaylistMenu = function(result){
                console.log("[func] buildAddToPlaylistMenu");

                var playlist_menu = {};

                for (var i = 0; i < result.length; i++){
                    var playlist = result[i];
                    var next =  {
                        name: playlist.p.properties.name,
                        callback: function(key, opt){
                            var pid = JSON.parse($('#' + key).attr("data-playlist")).p._id;
                            var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
                            var url = 'http://localhost:3000/api/playlists/' + pid + '/add/' + tid;
                            $http.post(url, {}).then(function(response){
                                console.log(response);
                            }, function(error){
                                console.log(error);
                            })

                        }
                    }
                    playlist_menu['playlist' + i] = next;
                }

                ctlr.playlist_menu = playlist_menu;

            }

            ctlr.buildDeleteFromPlaylistMenu = function(playlist){
                console.log("[func] buildDeleteFromPlaylistMenu");

                    var func =  function(key, opt){
                        var pid = playlist.p._id;
                        var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
                        var url = 'http://localhost:3000/api/playlists/' + pid + '/remove/' + tid;
                        $http.delete(url).then(function(response){
                            console.log(response);
                            ctlr.loadPlaylist(playlist);
                        }, function(error){
                            console.log(error);
                        })

                    }

                ctlr.delete_func = func;

            }

        }],
        controllerAs: "ctlr"
    };
}]);
