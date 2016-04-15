var queue = new Queue();
//how to use: http://code.stephenmorley.org/javascript/queues/

angular.module("Library", [])
    .factory("libraryLoader", ["$http", function ($http) {
        function load(done) {
            $http.get('http://localhost:3000/api/mycollection')
                .success(function(data, status, headers, config){
                    done(null, data);
                })
                .error(function(data, status, headers, config){
                    console.log(status);
                    var ordersErr = new Error(data);
                    ordersErr.code = status;
                    done(ordersErr);
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
            controller: ["libraryLoader", "$q", '$http', function (libraryLoader, $q, $http) {
                var ctlr = this;

                ctlr.convertTime = function(time){
                    var min_sec = time / 1000 / 60;
                    var minutes = Math.floor(min_sec);
                    var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
                    return minutes + ":" + seconds;
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

                libraryLoader.load(function (err, result) {
                    if (err) {
                        ctlr.isLoaded = false;
                    }
                    else {
                        ctlr.data = result;
                        ctlr.isLoaded = true;
                        //TODO: Fix this shite code. The function doesn't work
                        //      when called immediately.
                        setTimeout(function() { createList(); }, 1000);
                    }
                });
            }],
            controllerAs: "ctlr"
        };
    }]);


var options = {
    valueNames: ['channel', 'name', 'genre', 'duration', 'date']
};

function createList(){
    console.log("create list");
    new List('library', options);
}

//TODO: Sort by date. list.js only seems to sort alphanumeric strings.