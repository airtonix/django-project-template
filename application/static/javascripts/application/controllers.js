(function(){
    'use strict';

        angular.module("app.controllers", [])

            .controller("DoSomethingController", [
                    "$Application",
                    "$log",
                    "$rootScope",
                    "$scope",
                    "Restangular",
                    function($Application, $log, $rootScope, $scope, Restangular){
                        $scope.Something = function(){
                            Restangular.all("an-endpoint/").post({
                                    key: value
                                })
                                .then(function(data, status){
                                    if(data){
                                        $rootScope.$broadcast("event:modal-close");
                                    }
                                })
                        }
                    }])


})();