var queue = new Queue();
//how to use: http://code.stephenmorley.org/javascript/queues/

angular.module("Library", [])
    .factory("httpLoader", ["$http", function ($http) {
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
    }])
    .factory("playlistLoader", ["$http", function ($http) {
        function load(pid, done) {
            console.log(pid);
            var url = 'http://localhost:3000/api/playlists/' + pid;
            console.log(url);
            $http.get(url)
                .success(function(data, status, headers, config){
                    done(null, data);
                })
                .error(function(data, status, headers, config){
                    console.log(status);
                    var playlistErr = new Error(data);
                    playlistErr.code = status;
                    done(playlistErr);
                });
        }
        return {
            load: load
        };
    }])
    .directive("library", [function (){
        return {
            restrict: 'E',
            templateUrl: 'http://localhost:3000/views/library.html',
            controller: ["httpLoader", "$q", '$http', function (httpLoader, $q, $http) {
                var ctlr = this;

                ctlr.sortType = 'name';
                ctlr.sortReverse = false;
                ctlr.searchTerm = '';

                ctlr.convertTime = function(time){
                    var min_sec = time / 1000 / 60;
                    var minutes = Math.floor(min_sec);
                    var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
                    return minutes + ":" + seconds;
                }

                ctlr.updateSort = function(sortBy){
                    if (ctlr.sortType == sortBy)
                        ctlr.sortReverse = !ctlr.sortReverse; 
                    else
                        ctlr.sortReverse = false;
                    ctlr.sortType = sortBy;
                }

                ctlr.formatDate = function(date){
                    return date.substring(0, 10);
                }

                ctlr.playSong = function(track, element){

                    queue = new Queue();
                    var i = 0;
                    while (element.$$nextSibling && i < 20){
                        var properties = element.$$nextSibling.track.t.properties;
                        var options = { 
                            scid: properties.id,
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

                ctlr.loadPlaylist = function(playlist){
                    var url = 'http://localhost:3000/api/playlists/' + playlist.p._id;
                    httpLoader.load(url, function(err, result){
                        if (err)
                            console.log(err);
                        else {
                            ctlr.display = result;
                        }
                    })
                }

                ctlr.displaySongs = function(){
                    ctlr.display = ctlr.collection;
                }

                httpLoader.load('http://localhost:3000/api/mycollection', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ctlr.collection = result;
                        ctlr.display = result;
                    }
                });

                httpLoader.load('http://localhost:3000/api/myplaylists', function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        ctlr.playlists = result;
                    }
                });

            }],
            controllerAs: "ctlr"
        };
    }]);

