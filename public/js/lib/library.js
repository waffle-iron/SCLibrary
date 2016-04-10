console.log("loaded js");

angular.module("Library", [])
    .factory("libraryLoader", ["$http", function ($http) {
        function load(done) {
            $http.get('http://localhost:3000/api/mycollection')
                .success(function(data, status, headers, config){
                    console.log (this);
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
                console.log("in directive controller");
                var ctlr = this;
                libraryLoader.load(function (err, result) {
                    if (err) {
                        ctlr.isLoaded = false;
                    }
                    else {
                        ctlr.data = result;
                        console.log(ctlr.data);
                        ctlr.isLoaded = true;
                    }
                });
            }],
            controllerAs: "ctlr"
        };
    }])
    .controller("LibraryController", ["$scope", function ($scope) {
        var ctlr = this;
/*
        ctlr.getOrder = function (order) {
            window.open('/api/orders/' + order.storeId + '/' + order.id)
        };

        ctlr.getSnapshotInterchange = function (line_item) {
            window.open('/api/snapshot/export/lineitem/' + line_item.snapshot_id);
        };

        ctlr.getAsset = function (line_item, item, asset) {
            window.open('/api/snapshot/preview/' + line_item.snapshot_id + '/asset/' + item + '/' + asset);
        };

        ctlr.getVariableDisplayName = function(variable){
            var name = "";
            variable.forEach(function(pair){
                if (pair.key == "prototype"){
                    name = pair.value.displayName;
                }
            });
            return name;
        };

        ctlr.previewSvg = function(svg){
            var x = window.open();
            var open = '<svg id="scale-box" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 345.3971354106 234.94596353754002" preserveAspectRatio="xMinYMin meet">'
            var close = '</svg>';
            console.log(open + svg + close);
            x.document.write(open + svg + close);
        }
*/
    }]);