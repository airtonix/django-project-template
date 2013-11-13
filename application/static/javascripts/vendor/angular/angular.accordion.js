/**
* simpleaccordion Module
*
* A simple accordion module
*/
var interactionEvents = {
		start: "mousedown touchstart",
		end: "mouseup touchend"
	}

angular.module('simpleAccordion', [])

	// .directive('accordion', ['$rootScope', function($rootScope){
	// 	// Runs during compile
	// 	return {
	// 		controller: function($scope, $element, $attrs, $transclude, $log) {
	// 			$scope.leaves = []
	// 			$scope.$on("ui.accordion.leaf.created", function(scope, leaf){
	// 				$scope.leaves.push(leaf)
	// 			})
	// 		},
	// 		restrict: 'ACE',
	// 		link: function($scope, iElm, iAttrs, controller) {
	// 			$scope.$emit("ui.accordion.created", iElm)
	// 		}
	// 	};
	// }])

	.directive('accordionLeaf', ['$log', function($log){
		return {
			scope: {},
			restrict: 'ACE',
			link: function($scope, iElm, iAttrs, controller) {
				$log.info(iElm, iAttrs)
				$scope.$on("ui.accordion.toggle.leaf", function(scope, element){
					iElm.toggleClass("active");
				});
			}
		};
	}])

	.directive('accordionTitle', ['$log', function($log){
		return {
			restrict: 'ACE',
			link: function($scope, iElm, iAttrs, controller) {
				$scope.$emit("ui.accordion.title.created", iElm)
				iElm.bind( interactionEvents.end, function(Event){
					$scope.$emit("ui.accordion.toggle.leaf", iElm)
				})
			}
		};
	}])

	.directive('accordionContent', ['$log', function($log){
		return {
			restrict: 'ACE',
			link: function($scope, iElm, iAttrs, controller) {
				$scope.$emit("ui.accordion.content.created", iElm)
			}
		};
	}])