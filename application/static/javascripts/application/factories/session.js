 (function(){
    'use strict'

    console.log("app.factories.session")

    angular.module("app.factories.session", [])
        .factory("$Session", [function($log, $http){
                return {
                    User: null,
                    refresh: function refreshUser(){},
                    get_name: function GetHumanNameorUsername(){},
                    has_features: function DoesUserHaveFeature(ArrayOfFeatureCodes){}
                }
            }])
        .run(['$rootScope', '$log', '$Session',
            function($rootScope, $log, $Session ){
                $rootScope.Session = $Session;
            }])

})();
