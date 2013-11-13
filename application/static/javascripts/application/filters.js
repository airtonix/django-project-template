(function(){
    'use strict';

        angular.module("app.filters", [])

            .filter('range', function() {
                    return function(input, total) {
                        total = parseInt(total);
                        for (var i=0; i<total; i++) {
                            input.push(i);
                        }
                        return input;
                    };
                })

            .filter('url', function ($route) {
                    function resolveRoute(options, route) {
                        var parts = route.split('/');
                        for (var i = 0; i < parts.length; i++) {
                            var part = parts[i];
                            if (part[0] === ':') {
                                parts[i] = options[part.replace(':', '')];
                                if (parts[i] == undefined) throw Error('Attribute \'' + part + '\' was not given for route \'' + route + '\'')
                            }
                        }
                        return parts.join('/');
                    }

                    return function (options, routeName) {
                        var routes = [];
                        angular.forEach($route.routes,function (config,route) {
                            if(config.name===routeName){
                                routes.push(route);
                            }
                        });

                        if (routes.length == 1) {
                            return resolveRoute(options, routes[0]);
                        }
                        else if (routes.length == 0) {
                            throw Error('Route ' + routeName + ' not found');
                        }
                        throw Error('Multiple routes matching ' + routeName + ' were found');
                    }
                })

            .filter('template', function($Application){
                    return function(input, scope){
                        return $Application.template(input);
                    };
                })

            .filter('asset', function($Application){
                    return function(input, scope){
                        return  $Application.asset(input)
                    };
                })

            .filter("regroup", function() {
                    return _.memoize(function(collection, field_name) {
                        return _.groupBy(collection, function(item) {
                            return item[field_name];
                        });
                    })
                })

            .filter('title', function() {
                    return function(input, scope) {
                            return input.substring(0,1).toUpperCase()+input.substring(1);
                    };
                });


})();