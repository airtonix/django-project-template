(function () {
  'use strict';

    /*
        Zurb Foundation Reveal
            factory: $zurbJoyride
            directive: zurbJoyride

     */
    var interactionEvents = {
        end: 'touchend mouseup',
        start: 'touchstart mousedown'
    }

    angular.module('zurb.joyride', [
            'LocalStorageModule',
        ])

        .factory('$zurbJoyride', ['$log', '$rootScope', '$location', '$localStorageService',
                function ($log, $rootScope, $location, $localStorageService){
                    var joyride = {
                            container: null,
                            data: {},
                            key_prefix: 'zurb.joyride.',
                            defaultSelector: "[data-joyride]",
                            load: function (key) {
                                    /*
                                     * loads the step data object with `key`
                                     */
                                    $log.info("loading step data for ", this.key_prefix + key);
                                    var data = $localStorageService.get(this.key_prefix + key);
                                    if (data){
                                        this.data[key] = angular.fromJson(data);
                                        return this.data[key];
                                    };
                                },
                            save: function (key) {
                                    /*
                                     * saves the step data object with `key`
                                     */
                                    $log.info("saving step data for ", this.key_prefix + key);
                                    var data;
                                    if (key && this.data[key]){
                                        data = angular.toJson(this.data[key])
                                    }
                                    $localStorageService.add(this.key_prefix + key, data);
                                },
                            new: function(kwargs){
                                    /*
                                     * Creates a new step data object
                                     */
                                    var controller = kwargs.controller;
                                    var container = kwargs.container;
                                    if(!controller || !container) return;
                                    $log.info("creating new step data for ", this.key_prefix + controller);
                                    var data = {
                                        step: 0,
                                        totalSteps: container.find("li").length
                                    };
                                    this.data[controller] = data;
                                    this.save(controller);
                                    return data;
                                },
                            restart: function(kwargs){
                                    /*
                                     * Resets the step data.
                                     */
                                    var controller = kwargs.controller;
                                    var container = kwargs.container;
                                    $log.info("restarting tourguide for ", this.key_prefix + controller);
                                    var data = this.load(controller);
                                        data.step = 0;
                                        this.save(controller);
                                },
                            play : function(kwargs){
                                    var controller = kwargs.controller;
                                    var container = kwargs.container;
                                    var data = this.load(controller);
                                    var $this = this;
                                    var key = this.key_prefix + controller;
                                    if(!data){
                                        // no data means it's a new step;
                                        data = this.new(kwargs);
                                    }
                                    if(data.step >= data.totalSteps) return; // nothing to play
                                    $log.info("playing tourguide with step data", controller, container, data);
                                    container.joyride({
                                        postStepCallback: function (step, tip){
                                            data.step = step + 1;
                                            $this.save(controller);
                                        },
                                        postRideCallback: function (step, tip){
                                            data.step = data.totalSteps;
                                            $this.save(controller);
                                        },
                                        template: {
                                            'link'    : '<a href="#close" class="joyride-close-tip button button-gray"><span class="icon-remove"></span></a>',
                                            'timer'   : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
                                            'tip'     : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
                                            'wrapper' : '<div class="joyride-content-wrapper"></div>',
                                            'button'  : '<r class="button joyride-next-tip"></button>'
                                        }
                                    });
                                }
                        };
                    $rootScope.$on("zurb:reset-tourguide", function ($scope, kwargs){
                            joyride.restart(kwargs);
                            $scope.$broadcast("zurb.event:start-tourguide", kwargs);
                        });
                    $rootScope.$on("zurb.event:start-tourguide", function ($scope, kwargs){
                            joyride.play(kwargs);
                        });
                    return joyride;
                }])

        .directive("zurbJoyride", ['$parse', '$rootScope', '$log', function ($parse, $rootScope, $log) {
                    return {
                        restrict: 'A',
                        link: function(scope, element, attrs) {
                            var controller = scope.$parent.currentController;
                            var container = $(element);
                            if(container.length <= 0){
                                $log.warn("Tourguide: no tour for", controller);
                                return;
                            }else{
                                $rootScope.$broadcast("zurb.event:start-tourguide", {
                                    controller: controller,
                                    container: container
                                });
                                element.bind('$destroy', function() {
                                        $log.warn("Tourguide: destroyed");
                                    });
                            }
                        }
                    };
                }]);


    /*
        Zurb Foundation Breadcrumbs
            .factory: $BreadCrumbsService
            .directive: breadcrumbs
     */
    angular.module('zurb.breadcrumbs', [])

        .factory('$BreadCrumbsService', ['$rootScope', '$log', function($rootScope, $log) {
                        var data = {};
                        var ensureIdIsRegistered = function(id) {
                            if (angular.isUndefined(data[id])) {
                                data[id] = [];
                            }
                        };
                        var reset = function(id) {
                            data[id] = [];
                        };
                        return {
                            push: function(id, item) {
                                ensureIdIsRegistered(id);
                                data[id].push(item);
                                $rootScope.$broadcast('zurb.event:breadcrumbs-refresh');
                            },
                            get: function(id) {
                                ensureIdIsRegistered(id);
                                return angular.copy(data[id]);
                            },
                            resetCrumbs: function(id) {
                                reset(id);
                                $rootScope.$broadcast('zurb.event:breadcrumbs-refresh');
                            },
                            setLastIndex: function( id, idx ) {
                                ensureIdIsRegistered(id);
                                if ( data[id].length > 1+idx ) {
                                    data[id].splice( 1+idx, data[id].length - idx );
                                }
                            }
                        };
                    }])
        .directive('breadcrumbs', ['$log', '$BreadCrumbsService', function($log, $BreadCrumbsService) {
                    return {
                        restrict: 'EA',
                        template: '<ul class="breadcrumb"><li ng-repeat=\'bc in breadcrumbs\' ng-class="{\'active\': {{$last}} }"><a ng-click="unregisterBreadCrumb( $index )" ng-href="{{bc.href}}">{{bc.label}}</a><span class="divider" ng-show="! $last">|</span></li></ul>',
                        replace: true,
                        compile: function(tElement, tAttrs) {
                            return function($scope, $elem, $attr) {
                                var bc_id = $attr['id'],
                                    resetCrumbs = function() {
                                        $scope.breadcrumbs = [];
                                        angular.forEach($BreadCrumbsService.get(bc_id), function(v) {
                                            $scope.breadcrumbs.push(v);
                                        });
                                    };
                                resetCrumbs();
                                $scope.unregisterBreadCrumb = function( index ) {
                                    $BreadCrumbsService.setLastIndex( bc_id, index );
                                    resetCrumbs();
                                };
                                $scope.$on('zurb.event:breadcrumbs-refresh', function() {
                                    $log.log( "$on.breadcrumbsRefresh" );
                                    resetCrumbs();
                                } );
                            }
                        }
                    };
                }]);

    angular.module('zurb.tabs', [])
        .directive('tabbedView', function(){
            return {
                restrict: 'ACE',
                controller: function($scope, $element, $attrs, $transclude, $log){
                    $scope.Tabs = {}
                    $scope.Panes = {}

                    var disableItem = function(item){
                            item.removeClass('active');
                        }
                    var getItem = function(group, nameOrIndex){
                            var index = 0;
                            var key;
                            if(typeof(nameOrIndex) == 'number'){
                                for(key in group){
                                    if(index==nameOrIndex) return group[key];
                                    index++;
                                }
                            }else{
                                return group[nameOrIndex];
                            }
                        }
                    var enableItem = function(item){
                            item.addClass('active');
                        }
                    var disableTabs = function(tab, name){
                            for(var key in $scope.Tabs){ disableItem($scope.Tabs[key]); };
                            for(var key in $scope.Panes){ disableItem($scope.Panes[key]); };
                        }

                    var changeTab = function(nameOrIndex){
                            var pane = getItem($scope.Panes, nameOrIndex);
                            var tab = getItem($scope.Tabs, nameOrIndex);

                            if(!pane || !tab) return false;

                            disableTabs()
                            enableItem(tab)
                            enableItem(pane)
                        };

                    $log.info("TabController Registered")

                    $scope.$on("event:segmented-controller-tab-created", function(scope, element, elementAttrs){
                        var tabName = elementAttrs.tab;
                        $scope.Tabs[tabName] = element
                        $log.info("Tab Created", tabName)
                    })
                    $scope.$on("event:segmented-controller-pane-created", function(scope, element, elementAttrs){
                        var paneName = elementAttrs.pane;
                        $scope.Panes[paneName] = element
                        $log.info("Pane Created", paneName)
                    })

                    $scope.$on("event:segmented-controller-tab-pressed", function(scope, element, elementAttrs){
                        changeTab(elementAttrs.tab)
                    })

                }
            }
        })
        .directive('tabbedViewTab', function($rootScope, $log){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    scope.$emit("event:tabbedview-tab-created", element, attrs)
                    element.bind(interactionEvents.end, function(e){
                        scope.$emit("event:tabbedview-tab-pressed", element, attrs)
                    })
                }
            }
        })

        .directive('tabbedViewPane', function($rootScope, $log){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    element.addClass('tabbedview-pane')
                    scope.$emit("event:tabbedview-pane-created", element, attrs)
                }
            }
        })



    /*
        Zurb Foundation Reveal
            .factory: $RevealService
            .directive: revealModal
    */
    angular.module('zurb.reveal', [])

        .factory('$zurbRevealService', ['$http', '$rootScope', '$compile', '$timeout', '$log', '$templateCache',
            function ($http, $rootScope, $compile, $timeout, $log, $templateCache){
                return {
                    modals: {},
                    modalBackground: null,
                    modalContainer: null,
                    getModal: function(urlMoniker){
                            var modal = this.modals[urlMoniker]
                            if(!modal){
                                modal = $('<modal>{{content}}</modal>');
                                modal.attr('data-modal-url', urlMoniker)
                                this.modals[urlMoniker] = modal;
                            }
                            return modal;
                        },
                    removeModal: function(urlMoniker){
                            var modal = this.modals[urlMoniker]
                            if(modal) modal.removeClass("active").remove();
                        },
                    closeAll: function(){
                            var modal;
                            var $this = this;
                            for(var key in this.modals){
                                $this.close(key)
                            }
                        },
                    close: function (url){
                            var $this = this;
                            var modal = $this.modals[url];
                                $this.modalContainer.removeClass("modal-active")
                            $timeout(function(){
                                    modal.remove();
                                }, 500);
                        },
                    load: function(url, scope, options){
                            var $this = this;
                            if(options && options.length) options = angular.fromJson(options);
                            $http({ method: "GET", url: url })
                                .success(function (data, status, headers, config) {
                                        var modal = $this.getModal(url);
                                        var container = $this.modalContainer;
                                            if(options){
                                                if("class" in options) modal.addClass(options.class);
                                                if("container" in options){
                                                    container = $(options.container)
                                                    modal.addClass(options.class);
                                                }
                                            }
                                            modal.html(data);
                                            $compile(modal)(scope);
                                            container.addClass("modal-active")
                                            container.append(modal)
                                            modal.container = container
                                    })
                                .error(function(data, status, headers, config){
                                        $log.error(data)
                                    });
                            scope.$apply();
                        }

                };
            }])
        .directive('loadModal', function($rootScope, $log){
                return {
                    restrict: 'ACE',
                    // template: '<div class="moda"><a class="close-modal button"><span class="icon-remove"></span></a> {{content}}</div>',
                    link: function postLink(scope, element, attrs) {
                        element.addClass("disabled")
                        scope.$watch(attrs.loadModal, function(url){
                            element.removeClass("disabled")
                            if(typeof(url)=='undefined') url = attrs.loadModal;
                            element.bind("click", function(){
                                $rootScope.$broadcast('event:modal-open', url, scope, attrs.modalOptions);
                            });
                        })
                    }
                };
            })
        .directive('modalContainer', function(){
                return {
                    restrict: "ACE",
                    link: function(scope, element, attrs){
                        element.addClass('modal-container modal-ready')
                        scope.$emit("ui.modal.created:modal-container", element)
                    }
                }
            })
        .directive('modalBackground', function(){
                return {
                    restrict: "ACE",
                    link: function(scope, element, attributes){
                        scope.$emit("ui.modal.created:modal-background", element)
                        element.bind("click", function(){
                            scope.$emit("event:modal-close")
                        })
                    }
                };
            })
        .directive('modal', function(){
                return {
                    restrict: "ACE",
                    replace: true,
                    link: function(scope, element, attributes){
                        element.addClass("modal")
                        scope.$emit("ui.modal.created:modal", element)
                        $(window).bind("keyup", function(event){
                            if(event.keyCode==27) $scope.$emit("event:modal-close")
                        })
                    }
                }
            })
        .directive('closeModal', function(){
                return {
                    restrict: "ACE",
                    link: function(scope, element, attrs){
                        element.bind(interactionEvents.end, function(){
                            scope.$emit("event:modal-close")
                        })
                    }
                }
            })
        .run(function($log, $rootScope, $zurbRevealService){
                $rootScope.$on("ui.modal.created:modal-container", function(scope, element){
                    $zurbRevealService.modalContainer = element;
                })
                $rootScope.$on("ui.modal.created:modal-background", function(scope, element){
                    $zurbRevealService.modalBackground = element;
                })

                $rootScope.$on("event:modal-open", function(scope, url, iScope, options){
                    $zurbRevealService.load(url, iScope, options);
                })
                $rootScope.$on("event:modal-close", function (scope, url){
                    if(!url){
                        $zurbRevealService.closeAll();
                    }else{
                        $zurbRevealService.close(url);
                    }
                })

                // $rootScope.$on("$routeChangeSuccess", function(scope){
                //     $zurbRevealService.closeAll();
                // })

            })


    angular.module('zurb', [
            'zurb.reveal',
            'zurb.joyride',
            'zurb.breadcrumbs'
        ]);


})();