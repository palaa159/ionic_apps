var myApp = angular.module('myApp', ['ionic']); // defining angular world
// Cache $http
myApp.config(['$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.cache = true;
    }
]);
myApp.run(['$ionicPlatform', 'Data', 'fetchData',
    function($ionicPlatform, Data, fetchData) { // immediately run function
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // StatusBar.styleDefault();
            }
            // fetch data from API
            Data.updateData();
            fetchData.fetchAll();
        });
    }
]);

// Data Factory (films, cinemas, showtimes)
myApp.factory('Data', function() {
    var Data = {
        filterRange: localStorage.getItem('filterRange') || 10,
        films: JSON.parse(localStorage.getItem('tempFilms')) || [],
        cinemas: JSON.parse(localStorage.getItem('tempCinemas')) || [],
        showtimes: JSON.parse(localStorage.getItem('tempShowtimes')) || [],
    } || {};
    return {
        updateData: function() {
            filterRange = localStorage.getItem('filterRange') || 10;
            Data.films = JSON.parse(localStorage.getItem('tempFilms')) || [];
            Data.cinemas = JSON.parse(localStorage.getItem('tempCinemas')) || [];
            Data.showtimes = JSON.parse(localStorage.getItem('tempShowtimes')) || [];
        },
        updateRange: function(newrange) {
            Data.filterRange = localStorage.setItem('filterRange', newrange);
            // console.log('new range: ' + localStorage.getItem('filterRange'));
        },
        data: Data
    };
});

// Ajax Call Factory
myApp.factory('fetchData', ['$http', 'Data',
    function($http, Data) {
        return {
            // ajax call -> success -> save in localstorage -> put inside factory
            // ajax call -> error -> use tempData
            getFilms: function() {
                return $http.get('http://www.moveedoo.com/app/films/fUa782_2.php')
                    .success(function(data) {
                        localStorage.setItem('tempFilms', JSON.stringify(data));
                        Data.updateData();
                    });
            },
            getCinemas: function() {
                var latLng = [13.726746, 100.576539];
                return $http.get('http://www.moveedoo.com/app/cinemas/fUa782_2.php', {
                    params: {
                        'data[]': latLng // hahahaha
                    }
                })
                    .success(function(data) {
                        localStorage.setItem('tempCinemas', JSON.stringify(data));
                        Data.updateData();
                        console.log(data);
                    });
            },
            getShowtimes: function() {
                return $http.get('http://www.moveedoo.com/app/showtimes/fUa782_2.php')
                    .success(function(data) {
                        localStorage.setItem('tempShowtimes', JSON.stringify(data));
                        Data.updateData();
                    });
            },
            fetchAll: function() {
                this.getFilms();
                this.getCinemas();
                this.getShowtimes();
            }
        };
    }
]);

// helpers
myApp.factory('Helper', ['$location',
    function($location) {
        return {
            go: function(path) {
                window.location.hash = path;
            },
            goBack: function() {
                window.history.back();
            }
        };
    }
]);

// Filters
myApp.filter('findObjById', function() {
    return function(id, array) {
        var x;
        angular.forEach(array, function(v, i) {
            if (id == v.id) {
                x = v;
            }
        });
        return x;
    };
});
myApp.filter('findShowtimeByFilmId', ['Data', '$filter',
    function(Data, $filter) {
        return function(id) {
            var showtime = [];
            angular.forEach(Data.data.showtimes, function(v, i) {
                if (v.film_id == id && Math.floor($filter('findObjById')(v.cinema_id, Data.data.cinemas).distance) < localStorage.getItem('filterRange')) {
                    showtime.push(v);
                }
            });
            return _.groupBy(showtime, 'cinema_id');
        };
    }
]);

myApp.filter('groupBy', function() {
    return _.memoize(function(items, field) {
        return _.groupBy(items, field);
    });
});

//// CONTROLER ////

myApp.controller('FilmsCtrl', ['$scope', '$timeout', 'fetchData', 'Data', 'Helper',
    function($scope, $timeout, fetchData, Data, Helper) {
        $scope.films = Data.data.films;
        // refresh films
        $scope.fetch = function() {
            fetchData.getFilms().success(function() {
                $scope.film = Data.data.films;
            }).
            finally(function() {
                $timeout(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                }, 2000);
            });
        };
        $scope.go = function(path) {
            Helper.go(path);
            // have no idea why $location wouldn't work
        };
    }
]);

myApp.controller('FilmDetailCtrl', ['$scope', '$stateParams', 'Data', 'Helper', '$filter', '$sce', '$q',
    function($scope, $stateParams, Data, Helper, $filter, $sce, $q) {
        $scope.id = $stateParams.id; // film.id
        $scope.thisFilm = function() {
            var data = {};
            // filter data
            data = $filter('findObjById')($scope.id, Data.data.films);
            return data;
        };
        $scope.go = function(path) {
            Helper.go(path);
            // have no idea why $location wouldn't work
        };
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };
        $scope.youtubeUrl = 'http://www.youtube.com/embed/' + $scope.thisFilm().trailer + '?controls=0&rel=0&showinfo=0&modestbranding=1';
        // get showtimes
        $scope.showtimes = $filter('findShowtimeByFilmId')($scope.id);
        // console.log($scope.showtimes);
        $scope.findObjById = function(id) {
            return $filter('findObjById')(id, Data.data.cinemas);
        };
        $scope.range = localStorage.getItem('filterRange') || 10;
    }
]);

myApp.controller('CinemasCtrl', ['$scope', 'fetchData', 'Data', 'Helper',
    function($scope, fetchData, Data, Helper) {
        $scope.cinemas = Data.data.cinemas;
        $scope.fetch = function() {
            fetchData.getCinemas().success(function() {
                $scope.cinemas = Data.data.cinemas;
            }).
            finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
        $scope.go = function(path) {
            Helper.go(path);
            // have no idea why $location wouldn't work
        };
    }
]);

myApp.controller('CinemaDetailCtrl', ['$scope', 'fetchData', 'Data', 'Helper',
    function($scope, fetchData, Data, Helper) {
        $scope.go = function(path) {
            Helper.go(path);
            // have no idea why $location wouldn't work
        };
    }
]);

myApp.controller('FavoritesCtrl', ['$scope', 'fetchData', 'Data',
    function($scope, fetchData, Data) {

    }
]);

myApp.controller('SettingsCtrl', ['$scope', '$ionicPopup', 'fetchData', 'Data',
    function($scope, $ionicPopup, fetchData, Data) {
        $scope.filterRange = localStorage.getItem('filterRange') || 10; // always = 10
        $scope.setNewRange = function(newval) {
            $scope.filterRange = newval;
            return Data.updateRange($scope.filterRange);
        };
        $scope.clearCache = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Moveedoo',
                template: 'Are you sure you want to clear cache?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    // console.log('You are sure');
                    localStorage.clear();
                    window.location.reload();
                } else {
                    // console.log('You are not sure');
                }
            });
        };
    }
]);