// create global filter
// {{data.message | reverse}}

myApp.filter('reverse', function() {
    return function(text) {
        return text.split('').reverse().join('');
    }
})

// ngRepeat

$scope.$watch // watch for change in data
$scope.$apply();

// controller
// <div ng-controller="WhatEverCtrl">
function WhatEverCtrl($scope) {

}

angular.element($('#foo')).addClass('bar');