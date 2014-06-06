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