(function(){
    'use strict';

    angular.module("app.config", [])
        .constant("NamedRoutesPrefix", "#")
        .constant('$Application', {
            settings: angular.extend({
                apiPrefix: 'api/v1',
                apiSuffix: '',
                template_root: null,
                static_root: null,
            }, window.Settings),
            api: function(path){ return this.settings.apiPrefix + path + this.settings.apiSuffix },
            template: function(path){ return this.settings.template_root + path; },
            static: function(path){ return this.settings.static_root + path; }
        })
        .config(function(RestangularProvider) {
            RestangularProvider.setBaseUrl("/api/v1");
        })
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.headers.common['X-CSRFTOKEN'] = $("input[name='csrfmiddlewaretoken']").val();
        }])

})();
