(function () {
  'use strict';

    angular.module('ratchet.directives', [])
        .directive('loadModal', function($rootScope, $log){
            return {
                restrict: 'ACE',
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
        .directive('modal', function(){
                return {
                    restrict: "ACE",
                    controller: function($scope, $element, $attrs, $transclude, $timeout, $log){

                    }
                }
            })
        .directive('closeModal', function(){
                return {
                    restrict: "ACE",
                    link: function(scope, element, attrs){
                        element.bind('touchend', function(){
                            scope.$emit("event:modal-close")
                        })
                    }
                }
            })


        .directive('buttonPrev', function($window){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    element.bind("touchend", function(){
                        $window.history.back();
                    })
                }
            }
        })

        .directive('triggerPopover', function($rootScope){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    element.bind('touchend', function(){
                        $rootScope.$broadcast("event:popover-trigger-pressed", attrs.triggerPopover)
                    })

                }
            }
        })
        .directive('popdown', function($rootScope){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    element.addClass("popdown")
                    element.bind('touchend', function(){
                        element.toggleClass("active")
                        $rootScope.$broadcast("event:popdown-pressed", element)
                    })

                }
            }
        })
        .directive('popover', function($rootScope){
            return {
                restrict: "ACE",
                controller: function($scope, $element, $attrs, $transclude, $log){
                    $scope.$on("event:popover-trigger-pressed", function(scope, popoverName){
                        $log.info("toggle popover with name", popoverName)
                        if($attrs.id == popoverName){
                            $element.toggleClass("active")
                        }else{
                            $element.removeClass("active")
                        }
                    })
                }
            }
        })


        .directive('segmentedControllerTabs', function(){
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
                        var tabName = elementAttrs.segmentedControllerTab;
                        $scope.Tabs[tabName] = element
                        $log.info("Tab Created", tabName)
                    })
                    $scope.$on("event:segmented-controller-pane-created", function(scope, element, elementAttrs){
                        var paneName = elementAttrs.segmentedControllerItem;
                        $scope.Panes[paneName] = element
                        $log.info("Pane Created", paneName)
                    })

                    $scope.$on("event:segmented-controller-tab-pressed", function(scope, element, elementAttrs){
                        changeTab(elementAttrs.segmentedControllerTab)
                    })

                }
            }
        })
        .directive('segmentedControllerTab', function($rootScope, $log){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    scope.$emit("event:segmented-controller-tab-created", element, attrs)
                    element.bind('touchend', function(e){
                        scope.$emit("event:segmented-controller-tab-pressed", element, attrs)
                    })
                }
            }
        })

        .directive('segmentedControllerItem', function($rootScope, $log){
            return {
                restrict: "ACE",
                link: function(scope, element, attrs){
                    element.addClass('segmented-controller-item')
                    scope.$emit("event:segmented-controller-pane-created", element, attrs)
                }
            }
        })


    angular.module('ratchet.services', [])

        .factory('$ratchetModalService', ['$http', '$rootScope', '$compile', '$timeout', '$log', '$templateCache',
            function ($http, $rootScope, $compile, $timeout, $log, $templateCache){
                return {
                    modals: {},
                    anchorContainer: null,
                    getModal: function(urlMoniker){
                            var container = $('body');
                            if(this.anchorContainer) container = this.anchorContainer;
                            var modal = this.modals[urlMoniker]
                            if(!modal){
                                modal = $('<section class="modal">{{content}}</section>');
                                modal.attr('url', urlMoniker)
                                this.modals[urlMoniker] = modal;
                            }

                            modal.appendTo(container);
                            return modal;
                        },
                    removeModal: function(urlMoniker){
                            var modal = this.modals[urlMoniker]
                            if(modal){
                                    modal.removeClass("active");
                                    modal.remove();
                                }
                        },
                    compileAndRunModal: function (modal, scope, options) {
                            $log.info("Compiling")
                            $compile(modal)(scope);
                            modal.addClass('active')
                            $log.info("Compiled")
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
                                modal.removeClass("active");
                            $timeout(function(){
                                    modal.remove();
                                }, 500)
                        },
                    load: function(url, scope, options){
                            var $this = this;
                            if(options && options.length) options = angular.fromJson(options);
                            $log.info("Fetch modal template", url, options)
                            $http({ method: "GET", url: url })
                                .success(function (data, status, headers, config) {
                                        $log.info("fetched", data, status)
                                        var modal = $this.getModal(url);
                                            modal.html(data);
                                        $timeout(function(){
                                            if(options && "class" in options) modal.addClass(options.class);
                                            $this.compileAndRunModal(modal, scope, options);
                                        }, 1)
                                    })
                                .error(function(data, status, headers, config){
                                        $log.error(data)
                                    });
                            scope.$apply();
                        }

                };
            }])

        .run(function($log, $rootScope, $ratchetModalService){
                $rootScope.$on("event:modal-open", function(scope, url, iScope, options){
                    $ratchetModalService.load(url, iScope, options);
                })

                $rootScope.$on("event:modal-close", function (scope, url){
                    if(!url){
                        $ratchetModalService.closeAll();
                    }else{
                        $ratchetModalService.close(url);
                    }
                })

            })

    angular.module('ratchet', [
            'ratchet.directives',
            'ratchet.services'
            ])


})();
