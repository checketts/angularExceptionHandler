angular.module('ErrorApp').service('FormGroupService', function () {
    var formGroups = {};

    var getErrors= function(){
        var inputsInError = [];
        _.forEach(formGroups,function(group,key){
            _.forEach(group.$error,function(entry,key){
                _.forEach(entry,function(input,key){
                    if(input.hasOwnProperty('$setViewValue')){
                        inputsInError.push(input);
                    }
                });
            });
        });

        return inputsInError;
    };

    var getFields = function(){
        var inputs = [];
        _.forEach(formGroups,function(group,key){
            _.forEach(group,function(input,key){
                if(input.hasOwnProperty('$setViewValue')){
                    inputs.push(input);
                }
            });
        });

        return inputs;
    };

    return {
        addFormGroup: function(name,formGroup){
            if(angular.isUndefined(name)){
                name = _.uniqueId('formGroup_');
            }

            formGroups[name] = formGroup;
            return function(){
                delete formGroups[name];
            };
        },
        groups: function(){
            return formGroups;
        },
        setDirty: function(){
            _.forEach(getErrors(),function(formInput){
                formInput.$setViewValue(formInput.$viewValue);
            });
        },
        getErrors: getErrors,
        getFields: getFields,
        isInvalid: function(){
            return _.any(formGroups,'$invalid');
        }
    };
});