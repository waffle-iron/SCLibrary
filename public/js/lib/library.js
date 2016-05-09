var autoqueue = [];
var queue = [];
var backqueue = [];

var app = angular.module("Library", []);

app.controller("LibraryCtlr", function($scope, $http){

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

    // Update sort variables
    $scope.updateSort = function(sortBy){
        if ($scope.sortType == sortBy)
            $scope.sortReverse = !$scope.sortReverse; 
        else
            $scope.sortReverse = false;
        $scope.sortType = sortBy;
    }

    // Convert time from ms to MM:SS
    $scope.convertTime = function(time){
        var min_sec = time / 1000 / 60;
        var minutes = Math.floor(min_sec);
        var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
        return minutes + ":" + seconds;
    }

    // Format date string
    $scope.formatDate = function(date){
        return date.substring(0, 10);
    }

    // Format playlist name string
    $scope.formatName = function(name){
        if (name.length > 26)
            return (name.substring(0,26).trim() + "...");
        else
            return name;
    }

    $scope.toggleChannels = function(){
        $scope.channels_visible = !$scope.channels_visible;
        if ($scope.channels_visible)
            $('#channel_list').show();
        else
            $('#channel_list').hide();

    }

    // Add a playlist to the database and hide the new playlist form
    $scope.createPlaylist = function(){
        console.log("[func] createPlaylist");
        console.log(loggedinuser);
        var url = 'http://localhost:3000/api/playlists/';
        var data = {
            name: $scope.playlistInput,
            uid: loggedinuser._id
        }
        $http.post(url, data).then(function(response){
            console.log(response);
            $scope.loadPlaylists();
        }, function(error){
            console.log(error);
        }); 

        $('.playlistForm').hide();
        $scope.playlistInput = '';
    }

    // Update the view with tracks from the selected playlist.
    $scope.loadPlaylist = function(playlist){
        console.log("[func] loadPlaylist");
        var url = 'http://localhost:3000/api/playlists/' + playlist.p._id;
        $http.get(url).then(function(response){
                $scope.display = response.data;
                $scope.context = 'playlists';
                $scope.currPlaylist = playlist.p._id;
                $scope.buildDeleteFromPlaylistMenu(playlist);
            }, function(error){
                console.log(error);
            })
    }

    // Delete playlist with permission from the user.
    $scope.deletePlaylist = function(playlist){
        console.log("[func] deletePlaylist");
        if (confirm("Are you sure you want to delete?") == true){
            var id = playlist.p._id;
            var url = 'http://localhost:3000/api/playlists/' + id;
            $http.delete(url).then(function(response){
                console.log(response);
                if ($scope.currPlaylist == id){
                    $scope.displaySongs();
                }
                $scope.loadPlaylists();
            }, function(error){
                console.log(error);
            })
        }
    }

    // Update the view with tracks from the selected playlist.
    $scope.loadSCPlaylist = function(playlist){
        console.log(playlist);
        console.log("[func] loadPlaylist");
        var url = 'http://localhost:3000/api/scplaylists/' + playlist.p._id;
        $http.get(url).then(function(response){
                $scope.display = response.data;
                $scope.context = 'scplaylists';
            }, function(error){
                console.log(error);
            })
    }

    $scope.loadChannel = function(channel){
        var uid = loggedinuser._id;
        var cid = channel.c._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/channels/' + cid;
        $http.get(url).then(function(response){
            console.log(response);
                $scope.display = response.data;
                $scope.context = 'channels';
            }, function(error){
                console.log(error);
            })
    }

    // Update the view with the user's collection
    $scope.displaySongs = function(){
        console.log("[func] displaySongs");
        $scope.display = $scope.collection;
        $scope.context = 'songs';
        $scope.currPlaylist = null;
    }

    $scope.displayQueue = function(){
        console.log("[func] displayQueue");
        $scope.display = queue;
        $scope.context = 'queue';
        $scope.currPlaylist = null;
    }

    // Populate the list of songs
    $scope.loadLibrary = function(){
        console.log("[func] loadLibrary");
        var url = 'http://localhost:3000/api/mycollection';
        $http.get(url).then(function(response){
            $scope.collection = response.data;
            $scope.displaySongs();
        }, function(error){
            console.log(error);
        });

    }

    // Populate the list of playlists
    $scope.loadPlaylists = function(){
        console.log("[func] loadPlaylists");
        var url = 'http://localhost:3000/api/myplaylists';
        $http.get(url).then(function(response){
            $scope.playlists = response.data;
            $scope.buildAddToPlaylistMenu(response.data);
            $scope.updateMenu();
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of playlists
    $scope.loadSCPlaylists = function(){
        console.log("[func] loadSCPlaylists");
        var url = 'http://localhost:3000/api/myscplaylists';
        $http.get(url).then(function(response){
            $scope.scplaylists = response.data;
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of playlists
    $scope.loadChannels = function(){
        console.log("[func] loadChannels");
        var url = 'http://localhost:3000/api/mychannels';
        $http.get(url).then(function(response){
            $scope.channels = response.data;
            console.log(response.data);
        }, function(error){
            console.log(error);
        });
    }

    $scope.updateMenu = function(){

        //Destroy the current context menu
        $.contextMenu( 'destroy' );

        //These options belong in every context
        var items = {
            add_playlist: {
                name: "Add to playlist...",
                items: $scope.playlist_menu
            }
        };

        //Include delete_playlist option when in a playlist
        if ($scope.context == 'playlists'){
            items.delete_playlist = {
                    name: "Delete from playlist",
                    callback: $scope.delete_func
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
                            $scope.display = queue.splice(i, 1);
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

    $scope.buildAddToPlaylistMenu = function(result){
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

        $scope.playlist_menu = playlist_menu;

    }

    $scope.buildDeleteFromPlaylistMenu = function(playlist){
        console.log("[func] buildDeleteFromPlaylistMenu");
        $scope.delete_func =  function(key, opt){
            var pid = playlist.p._id;
            var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
            var url = 'http://localhost:3000/api/playlists/' + pid + '/remove/' + tid;
            $http.delete(url).then(function(response){
                console.log(response);
                $scope.loadPlaylist(playlist);
            }, function(error){
                console.log(error);
            })
        }
    }

});


// Library directive - html Element
app.directive("library", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/library.html',
        scope: false,
        link: function(scope, element, attr) {

            $('#channel_list').hide();
            scope.channels_visible = false;

            // Set context to default option (songs)
            scope.context = 'songs';

            // Variables used for sort and search functionality
            scope.sortType = '';
            scope.sortReverse = false;
            scope.searchTerm = '';

            $('.playlistForm').hide();
            $('.addPlaylist').click(function(){
                $('.playlistForm').show();
            });

            // Draggable handles for the columns
            scope.colSizeable = attachColHandles();
            scope.playNext = nextListener();

            // Load song library, and channel/playlist names
            scope.loadLibrary();
            scope.loadChannels();
            scope.loadPlaylists();
            scope.loadSCPlaylists();

            console.log(scope);
            console.log(element);
            console.log(attr);

        }
    };
}]);
