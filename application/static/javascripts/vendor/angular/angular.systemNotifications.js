angular.module('zj.systemNotifications', [])
    .constant('notificationsClasses', { error: 'error', success: 'success' })
    .constant('notificationsStrings', {
        http200: "Incorrect authentication details",
        http401: "Incorrect authentication details",
        http403: "Insufficient permission",
        http500: "Server internal error: {{ data }}",
          error: "Error {{ status }}: {{ data }}"
        })
    .config(function($provide, $httpProvider) {
            $httpProvider.responseInterceptors.push(function($timeout, $q, $log, $systemNotificationService, notificationsClasses, notificationsStrings) {
                return function(promise) {
                    return promise.then(function(response) {
                        if (response.config.method.toUpperCase() != 'GET')
                            $systemNotificationService.add(notificationsClasses.success, 'Success', 5000);
                        return response;
                    }, function(response) {
                        switch (response.status) {
                            case 401:
                                $systemNotificationService.add(notificationsClasses.error, notificationsStrings.http401, 20000);
                                break;
                            case 403:
                                $systemNotificationService.add(notificationsClasses.error, notificationsStrings.http403, 20000);
                                break;
                            case 500:
                                $systemNotificationService.add(notificationsClasses.error, notificationsStrings.http500, 20000);
                                break;
                            default:
                                $systemNotificationService.add(notificationsClasses.error, notificationsStrings.error, 20000);
                        }
                        return $q.reject(response);
                    });
                };
            });
        })
    .factory("$systemNotificationService", function($log, $rootScope, notificationsClasses, notificationsStrings){
            return {
                queue: [],
                remove: function(index){
                    var item = this.queue.pop(index);
                    $rootScope.$broadcast("event:system-notification-queue-updated")
                },
                add: function(klass, text, timeout){
                    var item = this.queue.push({ class: klass, text: text, timeout:timeout })
                    $rootScope.$broadcast("event:system-notification-queue-updated")
                }
            }
        })
    .directive('systemNotifications', function($log, $systemNotificationService, notificationsClasses, notificationsStrings) {
            return {
                replace: true,
                template: "<div class='system-notifications'><ul><li data-ng-repeat='notification in Notifications' data-ng-class='notification.klass' data-ng-timeout='notification.timeout'>{{notification.text}}</li></ul></div>",
                controller: function($scope, $element, $attrs, $transclude, $log){
                    $log.info("Setting up system notifications display");
                    $scope.$on("event:system-notification", function(){
                        $scope.Notifications = $systemNotificationService.queue;
                    });
                }
            };
        });