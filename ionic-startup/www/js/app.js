// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myApp = angular.module('myApp', ['ionic']); // defining angular world
// Cache $http
myApp.config(['$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.cache = false;
    }
]);
myApp.run(['$ionicPlatform',
    function($ionicPlatform) { // immediately run function
        $ionicPlatform.ready(function() {
            alert('running on ionic');
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                console.log('has status bar');
                StatusBar.styleDefault();
            }
            // fetch data from API
            // Data.updateData();
            // fetchData.fetchAll();
        });
    }
]);