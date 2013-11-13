(function(){
    'use strict';

    angular.module('app.directives',[])

        .directive('oembed', function($Application, $compile, $log, $http){
                var hosts = {
                    youtube: "//www.youtube.com/oembed?url=URL&format=json",
                    vimeo: "//vimeo.com/api/oembed.json?url=URL&byline=false&portrait=false",
                };
                var events = {
                    urlPatternRecieved: "event:oembed-pattern-recieved"
                };

                return {
                    restrict: "E",
                    scope: true,
                    compile: function(tElement, tAttributes, transclude){
                        return function(scope, element, attributes){

                            scope.$watch(attributes.url, function(embeddableUrl){
                                $log.info('oembed.compile.embeddableUrl.changed', embeddableUrl)
                                if(embeddableUrl!==undefined){
                                    var found=false;
                                    angular.forEach(hosts, function(oembedServiceUrl, key){
                                        if(embeddableUrl.indexOf(key)>=0){
                                            scope.$broadcast(events.urlPatternRecieved, oembedServiceUrl, embeddableUrl )
                                            found = true;
                                            return;
                                        }
                                    });
                                    if(!found) $log.error("Couldn't find a valid pattern for ", embeddableUrl);
                                }
                            });

                            scope.$on(events.urlPatternRecieved, function(scope, oembedServiceUrl, embeddableUrl){
                                $log.info('oembed.controller.broadcast.recieved', oembedServiceUrl, embeddableUrl);
                                var url = oembedServiceUrl.replace("URL", encodeURIComponent(embeddableUrl));
                                $http.get(url).then(function(response){
                                    element.replaceWith(response.data.html)
                                }, function(response){
                                    $log.error("Failed to retrieve oembed data", response);
                                })
                            })

                        }
                    }
                }
            })

        .directive('video', function($Application, $log) {
                return {
                    restrict: 'EA',
                    transclude: true,
                    replace: true,
                    scope: true,
                    templateUrl: $Application.template('partial/video.html'),
                    compile: function(tElement, tAttributes, transclude){
                        return function(scope, element, attributes){
                            $log.info("vide.compile.transclude", scope, element, attributes)
                            scope.$watch(attributes.type, function(newValue){
                                if(newValue!==undefined){
                                    scope.templateUrl = $Application.template("partial/video-"+newValue+".html");
                                }
                            });
                            angular.forEach(['code', 'title', 'width', 'height'], function(key){
                                scope.$watch(attributes[key], function(newValue){
                                    if(newValue!==undefined){
                                        $log.info("video.compile.transclude.watch."+key+".changed", newValue);
                                        scope[key] = newValue
                                    }
                                });
                            });
                        }
                    },
                    link: function(scope, element, attrs) {
                        $log.info(element,attrs, scope);
                        $log.info("video.link.scope", scope);
                        // scope.templateUrl = $Application.template("partials/video-"+scope.Exercise.type+".html");
                    // },
                    // controller: function($scope, $log){
                    //     $log.info("video.controller.$scope", $scope);
                    }
                };
            })

})();
