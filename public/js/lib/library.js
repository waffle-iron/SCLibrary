var queue = new Queue();
//how to use: http://code.stephenmorley.org/javascript/queues/

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

// Library directive - html Element
app.directive("library", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/library.html',
        link: function(scope, element, attr) {
            console.log(scope);

        },
        controller: ["httpLoader", "$q", '$http', '$timeout', function (httpLoader, $q, $http, $timeout) {
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

            // Send a song to the player and save the next 20 songs for an autoplay queue
            ctlr.playSong = function(track, element){

                queue = new Queue();
                var i = 0;
                while (element.$$nextSibling && i < 20){
                    var properties = element.$$nextSibling.track.t.properties;
                    var options = {
                        scid: properties.scid,
                        duration: properties.duration,
                        artwork_url: properties.artwork_url,
                        waveform_url: properties.waveform_url
                    }
                    queue.enqueue(options);
                    element = element.$$nextSibling;
                    i++;
                }

                var properties = track.t.properties;
                loadSong(properties.scid, properties.duration, properties.artwork_url, properties.waveform_url);
            }

            // Add a playlist to the database and hide the new playlist form
            ctlr.createPlaylist = function(){
                var url = 'http://localhost:3000/api/playlists/';
                var data = {
                    name: ctlr.playlistInput,
                    uid: loggedinuser.id
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
                var url = 'http://localhost:3000/api/playlists/' + playlist.p._id;
                httpLoader.load(url, function(err, result){
                    if (err)
                        console.log(err);
                    else {
                        ctlr.display = result;
                        ctlr.currPlaylist = playlist.p._id;
                    }
                })
            }

            // Delete playlist with permission from the user.
            ctlr.deletePlaylist = function(playlist){
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

            // Update the view with the user's collection
            ctlr.displaySongs = function(){
                ctlr.display = ctlr.collection;
                ctlr.currPlaylist = null;
            }

            // Populate the list of songs
            ctlr.loadLibrary = function(){
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
                httpLoader.load('http://localhost:3000/api/myplaylists', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ctlr.playlists = result;
                        ctlr.buildPlaylistMenu(result);
                    }
                });
            }
            
            // Draggable handles for the columns
            ctlr.colSizeable = function() { 
                attachColHandles();
            }

            // Draggable handles for the columns
            ctlr.colSizeable = attachColHandles();
            ctlr.playNext = nextListener();
            ctlr.loadLibrary();
            ctlr.loadPlaylists();


            ctlr.init = function(){

                var items = {
                        copy: {
                            name: "Copy",
                            callback: function(key, opt){

                            }
                        },
                        playlist: {
                            name: "Add to playlist...",
                            items: ctlr.playlist_menu
                        },
                        queue: {
                            name: "Add to Queue",
                            callback: function(key, opt){
                                var track = JSON.parse(opt.$trigger[0].dataset.track);
                                console.log(track.t.properties.scid);
                            }
                        }
                    };


                //console.log(ctlr.playlist_menu);
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
                })
            }

            ctlr.buildPlaylistMenu = function(result){

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



            $('.playlistForm').hide();
            $('.addPlaylist').click(function(){
                $('.playlistForm').show();
            });

        }],
        controllerAs: "ctlr"
    };
}]);

