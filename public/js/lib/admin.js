
var app = angular.module("Admin", []);

// Library directive - html Element
app.directive("admin", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/admin.html',
        scope: false,
        link: {
            pre: function(scope, element, attr) {

                // Load accounts and requests
                scope.loadAccounts();
                scope.loadRequests();

            },
            post: function(scope, element, attr) {

             
            }
        }
    };
}]);

// Library controller
app.controller("AdminCtlr", function($scope, $http){

    // Populate the list of songs
    $scope.loadAccounts = function(){
        var url = 'http://localhost:3000/api/accounts';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.accounts = response.data;
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of songs
    $scope.loadRequests = function(){
        var url = 'http://localhost:3000/api/requests';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.accounts = response.data;
        }, function(error){
            console.log(error);
        });
    }

});