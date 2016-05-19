
var app = angular.module("Admin", []);

// Library directive - html Element
app.directive("admin", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/admin.html',
        scope: false,
        link: {
            pre: function(scope, element, attr) {


            },
            post: function(scope, element, attr) {

             
            }
        }
    };
}]);

// Library controller
app.controller("AdminCtlr", function($scope, $http){



});