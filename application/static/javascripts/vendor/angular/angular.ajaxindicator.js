(function () {
  'use strict';

  /**
   * Loading Indicator
   *
   * @author Maikel Daloo
   * @date 12th March 2013
   *
   * Creates a new module and intercepts all ajax requests.
   * Every time a request is sent, we display the loading message and increment
   * the enable_counter variable. Then when requests complete (whether success or error)
   * we increment the disable_counter variable and we only hide the loading message
   * when the enable/disable counters are equal.
   *
   * @example
   * All that is required to get this working is to inject this module into your main
   * module. E.g.
   *     var app = angular.module('my-app', ['LoadingIndicator']);
   * Then the script will look for the element specified in the LoadingIndicatorHandler object
   * and show/hide it.
   */
  angular.module('LoadingIndicator', [])
    .constant("constLoadingIndicatorTemplate", "<div class='loading-indicator'></div>")
    .config([
        '$httpProvider',
        function($httpProvider) {
          var interceptor = [
            '$q',
            '$LoadingIndicatorHandler',
              function($q, $LoadingIndicatorHandler) {
                return function(promise) {
                    $LoadingIndicatorHandler.enable();

                    return promise.then(
                        function( response ) {
                            $LoadingIndicatorHandler.disable();

                            return response;
                        },
                        function( response ) {
                            $LoadingIndicatorHandler.disable();

                            // Reject the reponse so that angular isn't waiting for a response.
                            return $q.reject( response );
                        }
                    );
                };
            }];

          $httpProvider.responseInterceptors.push(interceptor);
      }])

    /**
     * $LoadingIndicatorHandler object to show a loading animation while we load the next page or wait
     * for a request to finish.
     */
    .factory('$LoadingIndicatorHandler', [
      '$rootScope', '$log',
      function($rootScope, $log) {
            return {
                // Counters to keep track of how many requests are sent and to know
                // when to hide the loading element.
                count: 0,
                /**
                 * Fade the blocker in to block the screen.
                 *
                 * @return {void}
                 */
                enable: function() {
                    this.count++;
                    $log.info("loading:item:start", this.count)
                    $rootScope.$broadcast("event:loading-indicator-show")
                },
                /**
                 * Fade the blocker out to unblock the screen.
                 *
                 * @return {void}
                 */
                disable: function() {
                    // this.disable_count++;
                    this.count--;
                    $log.info("loading:item:finish", this.count)
                    if ( this.count <= 0) {
                      this.count = 0;
                      $log.info("loading:all:finish", this.count)
                      $rootScope.$broadcast("event:loading-indicator-hide")
                    }
                }
            }
        }])

    .directive('containsLoadingIndicator', [ '$rootScope', '$LoadingIndicatorHandler',
      function($rootScope, $LoadingIndicatorHandler){
          return {
              restricts: "EAC",
              link: function(scope, element, attributes){

                  scope.$on("event:loading-indicator-hide", function(eventScope, data){
                    element.addClass('loading')
                  })
                  scope.$on("event:loading-indicator-show", function(eventScope, data){
                    element.removeClass('loading')
                  })
                  $LoadingIndicatorHandler.enable();
              }
          };
        }])

})();