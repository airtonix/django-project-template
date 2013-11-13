define(['angular', ], function (angular) {
    'use strict';


    /*
        Angular Apikey Session Authentication

        This module deals with the following concepts
            - anonymous / authenticated users
            - username/password for initial session authentication
            - apikeys instead of passwords for remaining interaction
            - feature flip code checking


        :: Dataflow

            event:login-required
                perform anything you need at this point, something like
                showing a login form would be appropriate

            LoginController.login
                sends username and password via an event to the session service

            $Session.login
                performs the api post to the login endpoint
                collects the user data and stores userid, apikey, username in time limited cookies
                on success, it broadcasts a login-confirmed


        :: Elements

            Service: $Session
                .hasFeatures
                .logout
                .login
                .setApiKeyAuthHeader
                .refreshCredentials
                .cacheCredentials
                .wipeCredentials


            Controller: LoginController
                .login


            Run: Initialise Module
                sets up all the events required to decouple this module.

                event:auth-login

                event:auth-logout

                event:auth-login-required

                event:auth-login-confirmed

                $routeChangeSuccess

     */

    angular.module("app.factories.session", [])
        .constant('constSessionExpiry', 20) // in minutes
        .constant('AuthenticationMethod', 'Session') // in minutes
        .constant('userIdRegex', /\/api\/v1\/user\/(\d+)\/$/) // in minutes
        .factory("$Session", [
                '$Application',
                '$rootScope',
                '$q',
                '$location',
                '$log',
                '$http',
                'Restangular',
                'authService',
                'constSessionExpiry',
                'userIdRegex',

                function($Application, $rootScope, $q, $location, $log, $http, Restangular, authService, constSessionExpiry, AuthenticationMethod, userIdRegex) {
                    return {
                        loginInProgress: false,
                        User: null,
                        UserIdRegex: new RegExp(userIdRegex),
                        hasFeatures: function(){
                            /*
                                Uses underscore _.difference to yield a list of feature
                                codes the user does not have.

                                returns:
                                    false: if the user is missing feature codes,
                                    true: if the user has all the requested feature codes

                                ::arguments, array
                                    list of feature codes you want to check for
                             */
                                // bail out early
                                if(!this.User || !this.User.features) return false;
                                var userCodeList = this.User.features.all.split(" ");
                                return _.difference(arguments, userCodeList).length == 0
                            },

                        authSuccess: function(){
                                this.loginInProgress = false;
                                $rootScope.$broadcast('event:session-changed');
                                authService.loginConfirmed();
                            },

                        logout: function(){
                                $log.info("Handling request for logout");
                                this.wipeUser();
                                Restangular
                                    .one('user', this.User.id).all('logout')
                                    .get().then(function success(response){
                                            $log.info(response)
                                            $rootScope.$broadcast('event:auth-logout-confirmed');
                                        })
                            },

                        login: function(data){
                                $log.info("Preparing Login Data", data);
                                var $this = this;
                                return Restangular
                                        .all('user/login/')
                                        .post(data)
                                        .then(function userLoginSuccess(response){
                                            $log.info("login.post: auth-success", response);
                                            $this.User = response;
                                            if(AuthenticationMethod == "ApiKey") $this.refreshApiKey();
                                            $this.authSuccess();
                                        }, function userLoginFailed(response){
                                            $log.info('login.post: auth-failed', response);
                                            $this.logout();
                                            return $q.reject(response);
                                        });
                            },
                        humanOrUserName: function(){
                                if(!this.User) return "Anonymous";
                                if(this.User.first_name && this.User.first_name.length>0){
                                    var output = [];
                                        output.push(this.User.first_name);
                                    if(this.User.last_name && this.User.last_name.length>0) output.push(this.User.last_name);
                                    return output.join(" ");
                                }else{
                                    return this.User.username;
                                }
                            },
                        setApiKeyAuthHeader: function(){
                                if(this.hasOwnProperty('User') && this.User){
                                    $http.defaults.headers.common.Authorization = "apikey "+this.User.username+':'+this.User.apikey;
                                    $log.info("Setting Authorization Header", $http.defaults.headers.common.Authorization)
                                }else{
                                    $log.info("No user for AuthHeader")
                                    delete $http.defaults.headers.common.Authorization;
                                }
                            },

                        isAuthenticated: function(){
                                return this.User && this.User.apikey;
                            },

                        refreshApiKey: function(){
                                var $this = this;
                                var cachedUser = lscache.get('userData');
                                $log.info("Request to pull User from Cache");
                                $log.info("$Session.User", $this.User)
                                $log.info('lscache.get("userData")', cachedUser)
                                $this.User = cachedUser;

                                if(!$this.isAuthenticated()){
                                    $log.warn("No user available.")
                                    $rootScope.$broadcast("event:auth-login-required")
                                }

                                if($this.User && $this.User.hasOwnProperty('apikey') && $this.User.apikey){
                                    $this.setApiKeyAuthHeader();
                                    return Restangular
                                        .one('user', $this.User.id)
                                        .get().then(function(response){
                                            $log.info("User data updated from server.")
                                            $this.User = response;
                                            $this.cacheUser();
                                            $this.setApiKeyAuthHeader();
                                            return response;
                                        }, function(response){
                                            $log.error("Error retrieving user. logging out.");
                                            $this.logout();
                                        })
                                }

                            },

                        cacheUser: function(){
                                if(!this.User){
                                    $log.warn("Can't cache a null value User")
                                    return false;
                                }
                                if(!this.User.hasOwnProperty("id") && this.User.hasOwnProperty("resource_uri")){
                                    $log.info("Building $this.User.id");
                                    var userId = this.User.resource_uri.match(this.UserIdRegex);
                                    this.User.id = userId.length?userId[1]:null;
                                }
                                $log.info("Caching User", this.User);
                                lscache.set('userData', this.User, constSessionExpiry);
                            },

                        wipeUser: function(){
                                $log.info("Wiping User");
                                lscache.remove('userData');
                                this.User = null;
                                if(AuthenticationMethod=="ApiKey") this.setApiKeyAuthHeader();
                                $rootScope.$broadcast('event:session-changed');
                            }
                    };
            }])
        .directive("sessionSignout", function(){
                return {
                    restrict: "EA",
                    link: function(scope, element, attribute){
                        element.bind('mouseup touchend', function(e) {
                            scope.$emit('event:auth-logout');
                        })
                    }
                }
            })
        .controller("LoginController", function($log, $Session, $scope, $rootScope){
                $scope.Login = function(){
                    $scope.$emit('event:auth-login', {username: $scope.username, password: $scope.password});
                }
            })

        .run(['$rootScope', '$log', '$Session', 'AuthenticationMethod',
            function($rootScope, $log, $Session, AuthenticationMethod){
                $rootScope.Session = $Session;

                //namespace the localstorage with the current domain name.
                lscache.setBucket(window.location.hostname);

                // on page refresh, ensure we have a user. if none exists
                // then auth-login-required will be triggered.
                if(AuthenticationMethod=="ApiKey") $Session.refreshUser();

                // Best practice would be to hook these events in your app.config

                // login
                $rootScope.$on('event:auth-login-required', function(scope, data) {
                        $log.info("session.login-required");
                    });

                $rootScope.$on('event:auth-login', function(scope, data) {
                        $log.info("session.send-login-details");
                        $Session.login(data);
                    });

                $rootScope.$on('event:auth-login-confirmed', function(scope, data) {
                        $log.info("session.login-confirmed");
                    });

                // logout
                $rootScope.$on('event:auth-logout', function(scope, data) {
                        $log.info("session.request-logout");
                        $Session.logout();
                    });
                $rootScope.$on('event:auth-logout-confirmed', function(scope, data) {
                        $log.info("session.logout-confirmed");
                    });

                // session state change
                $rootScope.$on('event:session-changed', function(scope){
                    $log.info("session.changed > ", $Session.User)
                })

                $rootScope.$on('$routeChangeStart', function(event, next, current) {
                        if(next.$$route && next.$$route.hasOwnProperty('loginRequired') && next.$$route.loginRequired && !$Session.User){
                            $log.info("Unauthenticated access to ", next.$$route)
                            $rootScope.$broadcast('event:auth-login-required')
                        }
                    });


            }])

})();
