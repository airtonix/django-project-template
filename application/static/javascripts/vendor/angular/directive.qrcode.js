/*
 * angular-qrcode v1.0.0
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */
angular.module('monospaced.qrcode', [])

  .directive('qrcode', ['$timeout', '$window', '$log', function($timeout, $window, $log){
    var trim = /^\s+|\s+$/g;
    var canvas2D = !!$window.CanvasRenderingContext2D,
        levels = {
          'L': 'Low',
          'M': 'Medium',
          'Q': 'Quartile',
          'H': 'High'
        // },
        // draw = function(context, qr, modules, tile){
        //   for (var row = 0; row < modules; row++) {
        //     for (var col = 0; col < modules; col++) {
        //       var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
        //           h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));
        //       context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
        //       context.fillRect(Math.round(col * tile), Math.round(row * tile), w, h);
        //     }
        //   }
        };

    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      transclude: true,
      link: function(scope, element, attrs){
        var domElement = element[0],
            // canvas = element.find('canvas')[0],
            version = Math.max(1, Math.min(parseInt(attrs.version, 10), 10)) || 4,
            correction = attrs.errorCorrectionLevel in levels ? attrs.errorCorrectionLevel : 'M',
            qr = qrcode(version, correction);
            qr.make();

        var modules = qr.getModuleCount(),
            size = parseInt(attrs.size, 10) || modules * 2,
            tile = size / modules,
            render = function(qr, data){
              qr.addData(data);
              qr.make();
              // if (canvas2D && !attrs.imgOnly) {
              //   draw(context, qr, modules, tile);
              // } else {
                domElement.innerHTML = qr.createImgTag(tile, 0);
              // }
              // element.attr("title", data)
            };

        // if (canvas2D && !attrs.imgOnly) {
        //   var context = canvas.getContext('2d');
        //   canvas.width = canvas.height = size;
        // }

        // if (!attrs.text) {
        //   return function(scope, element, attrs){
        //     transclude(scope, function(clone){
        //       $timeout(function(){
        //         var text = clone.text().replace(trim, '');
        //         render(qr, text);
        //       });
        //     });
        //   };

        // } else {
          scope.$watch(attrs.encode, function(value){
            if(value==undefined) return;
            var data = value.replace(trim, ''),
                qr = qrcode(version, correction);
            render(qr, data);
          });

        // }
      }
    };
  }]);

  // .directive('qrcode', ['$timeout', '$window', '$log', function($timeout, $window, $log){

  //   var canvas2D = !!$window.CanvasRenderingContext2D,
  //       levels = {
  //         'L': 'Low',
  //         'M': 'Medium',
  //         'Q': 'Quartile',
  //         'H': 'High'
  //       },
  //       draw = function(context, qr, modules, tile){
  //         for (var row = 0; row < modules; row++) {
  //           for (var col = 0; col < modules; col++) {
  //             var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
  //                 h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));
  //             context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
  //             context.fillRect(Math.round(col * tile), Math.round(row * tile), w, h);
  //           }
  //         }
  //       };

  //   return {
  //     restrict: 'E',
  //     template: '<canvas></canvas>',
  //     transclude: true,
  //     compile: function(element, attrs, transclude){
  //       var domElement = element[0],
  //           canvas = element.find('canvas')[0],
  //           version = Math.max(1, Math.min(parseInt(attrs.version, 10), 10)) || 4,
  //           correction = attrs.errorCorrectionLevel in levels ? attrs.errorCorrectionLevel : 'M',
  //           trim = /^\s+|\s+$/g,
  //           qr = qrcode(version, correction);

  //       qr.make();

  //       var modules = qr.getModuleCount(),
  //           size = parseInt(attrs.size, 10) || modules * 2,
  //           tile = size / modules,
  //           render = function(qr, text){
  //             qr.addData(text);
  //             qr.make();
  //             if (canvas2D) {
  //               draw(context, qr, modules, tile);
  //             } else {
  //               domElement.innerHTML = qr.createImgTag(tile, 0);
  //             }
  //           };

  //       if (canvas2D) {
  //         var context = canvas.getContext('2d');
  //         canvas.width = canvas.height = size;
  //       }

  //       if (!attrs.text) {

  //         return function(scope, element, attrs){
  //           transclude(scope, function(clone){
  //             $timeout(function(){
  //               var text = clone.text().replace(trim, '');
  //               render(qr, text);
  //             });
  //           });
  //         };

  //       } else {

  //         attrs.$observe('text', function(value){
  //           var text = value.replace(trim, ''),
  //               qr = qrcode(version, correction);
  //           render(qr, text);
  //         });

  //       }
  //     }
  //   };
  // }]);