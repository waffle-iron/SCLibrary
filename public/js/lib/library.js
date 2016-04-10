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
    valueNames: ['name', 'genre', 'duration']
};

function createList(){
    console.log("create list");
    new List('library', options);
}