/*
 Angular Tasty Pie Service
 TODO:
    configurable authentication method. valid options would be :
      basic_auth, api_key, token
*/

(function () {
  'use strict';
  angular.module('tastyPieHttpModule', ['LocalStorageModule']).
      run(function($http, $log, $localStorageService){
          $http.defaults.headers.common['Content-Type'] = 'application/json';

          $http.setCredentials = function(userData){
              if(!userData) userData = $localStorageService.get('UserData');
              $log.info("Saving Credentials", userData);
              var strAuthorizationHeader = 'ApiKey '+userData.username+':'+userData.apikey;
              $localStorageService.add('AuthorizationHeader', strAuthorizationHeader);
              $log.info("Credentials Saved:", strAuthorizationHeader);
              $http.refreshCredentials();
          };

          $http.wipeCredentials = function(){
              $log.info("Wiping Credentials");
              $localStorageService.remove('AuthorizationHeader');
              $http.defaults.headers.common['Authorization'] = null;
          };

          $http.refreshCredentials = function(){
              var strAuthorizationHeader = $localStorageService.get('AuthorizationHeader');
              if (strAuthorizationHeader){
                $log.info("Refreshing HTTP AuthorizationHeader from local storage");
                $http.defaults.headers.common['Authorization'] = strAuthorizationHeader;
              }
          };

      }).
      factory('JsonCache', function ($cacheFactory) {
          return $cacheFactory('jsonCache');
      }).
      factory('$tastyPieHttpModule', function($http, $log, $localStorageService, JsonCache) {
          return function(urlconf){
              var ApiResource = function(data){
                      if(typeof(data) == 'string' && data.indexOf("{") == 0){
                        data=angular.fromJson(data);
                      };
                      angular.extend(this, data);
                  };

                  ApiResource.prototype.json = function() {
                    return angular.toJson(this);
                  };

                  ApiResource.constructUrl = function(params, urlpattern){
                      $log.info("Request to build url", urlpattern, 'with params:', params)
                      var suffix="",
                          prefix="";

                      if(params){

                        if('search' in params) suffix += "?"+params.search;

                        if('path' in params){
                            $log.info("path override provided", params.path)
                            return params.path+suffix;
                        }
                      }

                      var output = "", value, bits=[];
                      _.each(urlpattern.split("/"), function(item){
                        if(item.length<=0) return;
                        bits[bits.length]=item;
                      });

                      $log.info(bits);
                      var bitKey, bit, kwarg, i=bits.length-1;
                      $log.info("pulling apart bits:", bits)
                      for(; i > 0; i--){
                        bit = bits[i];
                        if(bit && bit.indexOf(":") >= 0){
                          bitKey = bit.replace(":","");
                          kwarg = params?params[bitKey]:false;
                          $log.info("bit", i, "is", bit, "and will be ", kwarg)
                          if(kwarg){
                            $log.info("replacing kwarg", i, "of", bits.length, bitKey);
                            bits[i] = kwarg;
                          } else {
                            bits.splice(i)
                            $log.info("no kwarg, bailing out with", bits);
                            break;
                          }
                        }
                      }
                      output = bits.join('/');
                      return output+suffix;
                  };

                  ApiResource.get = function(params){
                      var resource = this;
                      var path = resource.constructUrl(params, urlconf);
                      var request = $http.get(path).then(
                            function(response){ return new ApiResource(response.data);},
                            function(reason){ throw reason; }
                          );
                      return request;
                  };

                  ApiResource.remove = function(params){
                      var resource = this;
                      var path = resource.constructUrl(params, urlconf);
                      return $http.delete(path);
                  };

                  ApiResource.create = function(params){
                      var resource = this;
                      var path = resource.constructUrl(params, urlconf);
                      return $http.post(path, resource).then(function(response){
                          return $http.get(response.headers('location')).then(function(response){
                              return new ApiResource(response.data);
                          });
                      }, function(reason){ throw reason; });
                  };

              return ApiResource;
          };
      });
})();
