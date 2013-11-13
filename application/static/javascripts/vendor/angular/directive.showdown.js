/*
 * angular-markdown-directive v0.1.0
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.markdown', []).
  filter("showdown", function($log) {
    var converter = new Showdown.converter();
    return _.memoize(function(input) {
        return converter.makeHtml(input);
    });
  }).
  directive('showdown', function($log) {
    var converter = new Showdown.converter();
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
          if (attrs.showdown) {
            scope.$watch(attrs.showdown, function (newVal) {
              var html = converter.makeHtml(newVal);
              element.html(html);
            });
          } else {
            var html = converter.makeHtml(element.text());
            element.html(html);
          }

      }
    };
  });