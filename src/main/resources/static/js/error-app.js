var app = angular.module('ErrorApp', []);

app.config(function ($provide) {

    $provide.decorator("$exceptionHandler", function ($delegate, $injector) {
        return function (exception, cause) {
            var rootScope = $injector.get("$rootScope");
            var HttpLoggingService = $injector.get("HttpLoggingService");
            if (rootScope) {
                HttpLoggingService.sendLog(exception + '\n\n' + exception.stack);
                rootScope.$broadcast('ccAppError',
                    {
                        type: 'danger',
                        msg: 'There was an error making a request. The support team has been notified. If necessary, please refresh your page and try again.',
                        details: exception + '\n\n' + exception.stack
                    }
                );
            }

            $delegate(exception, cause);
        };
    });
});

app.directive('ccShell', function () {
    return {
        restrict: 'E',
        template: '<div><div ng-if="rootData.err.length > 0" class="alert-danger">{{rootData.err}} <a ng-click="rootData.err = \'\'">Dismiss</a></div><div ng-transclude></div></div>',
        transclude: true,
        controller: function ($rootScope) {
            $rootScope.rootData = {};
            $rootScope.$on('ccAppError', function (event, data) {
                $rootScope.rootData.err = data.msg;
            })
        }
    }
});

app.controller('MainController', function mainController($scope,$http) {
    $scope.name = 'Bob';
//    some.err();

    $scope.hackSomething = function(){
        $http({method:'GET',url:'/boom'})
    }
});




//Http Intercpetor to check auth failures for xhr requests
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('ccHttpInterceptor');
}]);

app.factory('ccHttpInterceptor', function ($q, $rootScope, $interpolate, $log, HttpLoggingService) {
    var createLogMessage = function (response) {
        if (response.status) {
            return $interpolate('Http Failure: Status: {{status}}, Url: {{config.url}} Method: {{config.method}}')(response);
        } else {
            return angular.toJson(response);
        }
    };

    return {
        response: function (response) {
            HttpLoggingService.returnToService(response.config.url);
            return response || $q.when(response);
        },
        responseError: function (rejection) {
            $log.error('ccHttpResponseInterceptor response error', rejection);
            var logMessage = createLogMessage(rejection);
            HttpLoggingService.sendLog(logMessage);

            if (rejection.status === 403) {
                $rootScope.$broadcast('ccAppError', {type: 'danger', msg: 'Access Denied'});
            }
            else if (rejection.status === 503) {
                HttpLoggingService.serviceUnavailable(rejection.config.url, rejection.data.service);
                $rootScope.$broadcast('ccAppError',
                    {
                        type: 'danger',
                        msg: 'Some data is unavailable. If necessary, please refresh your page and try again.'
                    });
            }
            else if (rejection.status === 0) {
                //timeout or cancel? - they navigated away from the page
                $log.error('request was canceled or timed out ' + rejection.config.url);
            }
            else {
                $rootScope.$broadcast('ccAppError',
                    {
                        type: 'danger',
                        msg: 'There was an error making a request. The support team has been notified. If necessary, please refresh your page and try again.'
                    });
            }
            return $q.reject(rejection);
        }
    };
});


app.service('HttpLoggingService', function ($httpBackend, $window) {
    var buildLogInfo = function (msg) {
        msg = msg || '';
        return {
            page: $window.location.href,
            platform: $window.navigator.platform,
            browser: $window.navigator.userAgent,
            appCodeName: $window.navigator.appCodeName,
            appName: $window.navigator.appName,
            appVersion: $window.navigator.appVersion,
            msg: msg
        };
    };

    return {
        sendLog: function (msg) {
            $httpBackend('POST', '/logError', angular.toJson(buildLogInfo(msg)),
                function (status, resp, headerString) {
                },
                {"Content-Type": "application/json"}
            );
        },
        serviceUnavailable: function (url, service) {
            //Notify of unavailable service
        },
        returnToService: function (url) {
            //Notify of return to service service
        }
    };
});