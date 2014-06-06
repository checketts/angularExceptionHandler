var app = angular.module('ErrorApp');
app.directive("ccFormGroup", ['FormGroupService',function (FormGroupService) {
    return {
        restrict: "E",
        transclude: true,
        templateUrl: '/js/ccFormGroup.html',
        scope: {
            labelText:'=',
            errorText:'=',
            name: '@'
        },
        controller: function($scope) {

            $scope.showValidation= false;
            this.showValidation = function(){
                $scope.showValidation = true;
            };
        },
        link: function (scope, element, attrs) {
            console.log('directive',scope,attrs);
            if(angular.isObject(scope.errorText)){
                scope.errorTexts = scope.errorText;
            }

            var removeHandler = FormGroupService.addFormGroup(scope.name,scope.formGroupForm);

            scope.$on('$destroy',function(){
                removeHandler();
            });
        }
    };
}]);

(function(){
    var blurDirectiveHelper = function(){
        return {
            restrict: 'E',
            require: '^?ccFormGroup',
            link: function(scope, ele, attrs, ctrl){
                if (ctrl) {
                    ele[0].addEventListener('blur',function(){
                        scope.$apply(function(){
                            ctrl.showValidation();
                        });
                    });
                }
            }
        };
    };

    app.directive("input", blurDirectiveHelper);
    app.directive("textarea", blurDirectiveHelper);
    app.directive("select", blurDirectiveHelper);
})();
