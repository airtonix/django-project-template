(function () {
    'use strict';

    console.log("app.controllers.public");
    angular.module("app.controllers.public", [
            'app.config'
        ])
        .controller("HomeController",function($Application, $log, $rootScope, $scope, $route, $routeParams, Restangular){
        });

})();