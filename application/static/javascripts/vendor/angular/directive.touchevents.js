/**
  Angular Touch Events

 * Inspired by AngularJS' implementation of "click dblclick mousedown..." and this gist: https://gist.github.com/3298323
 *
 * This ties in touch events to attributes like:
 *
 *   te-touchstart="add_something()"
 *
 * Add in a script tag, then add to your app's dependencies.
 *
 */

(function () {
  'use strict';

  var directiveName = 'TouchEvents';
  var touchEvents = angular.module(directiveName, []);

  angular.forEach([
      'touchstart',
      'touchend',
      'touchmove',
      'touchcancel'
    ], function(eventName) {


      touchEvents.directive(directiveName, ['$parse', function($parse) {
        return function(scope, element, attr) {

          var fn = $parse(attr[directiveName]);
          var opts = $parse(attr[directiveName + 'Opts'])(scope, {});

          element.bind(eventName, function(event) {
            scope.$apply(function() { fn(scope, { $event: event }); });
          });

        };
      }]);

  });

})();