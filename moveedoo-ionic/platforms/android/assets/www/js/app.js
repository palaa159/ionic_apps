var myApp = angular.module('myApp', ['ionic', 'ngCordova']); // defining angular world
// Cache $http
myApp.config(['$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.cache = true;
    }
]);
myApp.run(['$ionicPlatform', 'Data', 'fetchData', '$rootScope', '$state',
    function($ionicPlatform, Data, fetchData, $rootScope, $state) { // immediately run function
        $ionicPlatform.ready(function() {
            $rootScope.tracked = false;
            // console.log('running on ionic');
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {}
            if (navigator.notification) { // Override default HTML alert with native dialog
                window.alert = function(message) {
                    navigator.notification.alert(
                        message, // message
                        null, // callback
                        "Moveedoo", // title
                        'Dismiss' // buttonName
                    );
                };
                window.confirm = function(message, onconfirm) {
                    navigator.notification.confirm(
                        message,
                        onconfirm,
                        'Moveedoo',
                        'Cancel, OK'
                    );
                };
            }
            // fetch data from API
            if (localStorage.length == 0) { // first time loader
                Data.init();
                Data.retrieve();
            } else {
                Data.retrieve();
            }
            // EVENT LISTENER
            document.addEventListener('resume', function() {
                $state.go('tabs.films');
            });
        }).then(function() {
            console.log('device loaded');
            console.log(localStorage.getItem('intro'));
            if (localStorage.getItem('intro') === 'false') {
                console.log('go to films cuz intro: ' + localStorage.getItem('intro'));
                $state.go('tabs.films');
            } else {
                console.log('go to landing cuz intro: ' + localStorage.getItem('intro'));
                $state.go('landing');
            }
        });
    }
]);

// Data Factory (films, cinemas, showtimes)
myApp.factory('Data', function() {
    var allData = {};
    return {
        init: function() {
            localStorage.setItem('intro', true);
            localStorage.setItem('filterRange', 10);
            localStorage.setItem('tempFilms', '[]');
            localStorage.setItem('tempCinemas', '[]');
            localStorage.setItem('tempShowtimes', '[]');
            localStorage.setItem('tempFavoriteFilms', '[]');
            localStorage.setItem('tempFavoriteCinemas', '[]');
        },
        retrieve: function() {
            allData.intro = localStorage.getItem('intro');
            allData.filterRange = localStorage.getItem('filterRange');
            allData.films = JSON.parse(localStorage.getItem('tempFilms'));
            allData.cinemas = JSON.parse(localStorage.getItem('tempCinemas'));
            allData.Showtimes = JSON.parse(localStorage.getItem('tempShowtimes'));
            allData.favoriteFilms = JSON.parse(localStorage.getItem('tempFavoriteFilms'));
            allData.favoriteCinemas = JSON.parse(localStorage.getItem('tempFavoriteCinemas'));
        },
        updateFavoriteFilms: function(id) {
            console.log('receiving id: ' + id);

            allData.favoriteFilms.push(id);
            allData.favoriteFilms = _.unique(allData.favoriteFilms);
            // console.log(allData.favoriteFilms);
            localStorage.setItem('tempFavoriteFilms', JSON.stringify(allData.favoriteFilms));
        },
        updateRange: function(newrange) {
            allData.filterRange = localStorage.setItem('filterRange', newrange);
            // console.log('new range: ' + localStorage.getItem('filterRange'));
        },
        updatePosition: function(lat, lng) {
            allData.position = [lat, lng];
            // console.log(allData.position);
        },
        getTime: function() {
            var date = new Date(),
                minute = date.getMinutes().toString(),
                hhmm;
            if (minute.length === 1) {
                hhmm = parseInt(date.getHours().toString().concat('0' + minute));
            } else {
                hhmm = parseInt(date.getHours().toString().concat(minute));
            }
            return hhmm;
        },
        storeAll: function(data) {
            allData.films = data[0].data || [];
            allData.cinemas = data[1].data || [];
            allData.showtimes = data[2].data || [];
            localStorage.setItem('tempFilms', JSON.stringify(data[0].data) || null);
            localStorage.setItem('tempCinemas', JSON.stringify(data[1].data) || null);
            localStorage.setItem('tempShowtimes', JSON.stringify(data[2].data) || null);
        },
        data: allData
    };
});

// Ajax Call Factory
myApp.factory('fetchData', ['$http', 'Data', '$q',
    function($http, Data, $q) {
        var getFilms = $q.defer();
        var getCinemas = $q.defer();
        var getShowtimes = $q.defer();

        getFilms.promise.then(success);
        getCinemas.promise.then(success);
        getShowtimes.promise.then(success);

        function success(data) {
                // console.log(data);
            }
            // $http.get
        var fetch = function() {
            $http.get('http://www.moveedoo.com/app/films/fUa782_2.php').then(function(data) {
                getFilms.resolve(data);
            });
            $http.get('http://www.moveedoo.com/app/cinemas/fUa782_2.php', {
                    params: {
                        'data[]': Data.data.position // hahahaha
                    }
                })
                .then(function(data) {
                    getCinemas.resolve(data);
                });
            $http.get('http://www.moveedoo.com/app/showtimes/fUa782_2.php').then(function(data) {
                getShowtimes.resolve(data);
            });
            return this;
        };

        var allDone = $q.all([getFilms.promise, getCinemas.promise, getShowtimes.promise]);
        return {
            allDone: allDone,
            fetch: fetch
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
            // console.log(showtime);
            return _.groupBy(showtime, 'cinema_id');
        };
    }
]);
myApp.filter('findShowtimeByCinemaId', ['Data', '$filter',
    function(Data, $filter) {
        return function(id) {
            var showtime = [];
            angular.forEach(Data.data.showtimes, function(v, i) {
                if (v.cinema_id == id) {
                    showtime.push(v);
                }
            });
            return _.groupBy(showtime, 'film_id');
        };
    }
]);

myApp.filter('groupBy', function() {
    return _.memoize(function(items, field) {
        return _.groupBy(items, field);
    });
});

myApp.filter('truncate', function() {
    return function(text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length - end.length) + end;
        }

    };
});

//// CONTROLER ////
myApp.controller('LoadingCtrl', ['$scope',
    function($scope) {

    }
]);

myApp.controller('LandingCtrl', ['$scope', '$ionicLoading', '$state', '$timeout',
    function($scope, $ionicLoading, $state, $timeout) {
        $scope.slideHasChanged = function(index) {
            console.log(index);
            if (index == 1) {
                localStorage.setItem('intro', false);
                // move to films
                $timeout(function() {
                    $state.go('tabs.films');
                }, 300);

            }
        };
    }
]);

myApp.controller('FilmsCtrl', ['$rootScope', '$scope', '$timeout', 'fetchData', 'Data', 'Helper', '$ionicLoading', '$cordovaGeolocation', '$http',
    function($rootScope, $scope, $timeout, fetchData, Data, Helper, $ionicLoading, $cordovaGeolocation, $http) {        $scope.films = Data.data.films;
        // refresh films
        $scope.refresh = function() {
            fetchData.fetch().allDone.then(function(data) {
                Data.storeAll(data);
                $scope.films = Data.data.films;
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
        //////////////////// IF NEVER TRACK ////////////////////
        if (!$rootScope.tracked) {
            $scope.loadingIndicator = $ionicLoading.show({
                content: '<img src="img/loader/ajax.gif"><br><b>Syncing Data</b>',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            // timeout
            $timeout(function() {
                $ionicLoading.hide();
            }, 7000);
            // Track location
            $cordovaGeolocation.getCurrentPosition().then(function(position) {
                $rootScope.tracked = true;
                // Position here: position.coords.latitude, position.coords.longitude
                // check if around Thailand or SEA
                $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true').then(function(data) {
                    var result = data.data.results[data.data.results.length - 1].formatted_address;
                    // console.log(result);
                    if (result == 'Thailand') {
                        Data.updatePosition(position.coords.latitude, position.coords.longitude);
                    } else {
                        // fallback to Thailand
                        // alert('fallback');
                        Data.updatePosition(13.726746, 100.576539);
                    }
                    // fetch
                    fetchData.fetch().allDone.then(function(data) {
                        console.log('done!');
                        // store data
                        Data.storeAll(data);
                        $scope.films = Data.data.films;
                        $ionicLoading.hide();
                    });
                });
                // never track again
            }, function(err) {
                // error
                // alert('fallback to thailand!');
                Data.updatePosition(13.726746, 100.576539);
                fetchData.fetch().allDone.then(function(data) {
                    console.log('done!');
                    // store data
                    Data.storeAll(data);
                    $scope.films = Data.data.films;
                    $ionicLoading.hide();
                });
            });

            var watch = $cordovaGeolocation.watchPosition({
                frequency: 100000
            });

            watch.promise.then(function() {
                // Not currently used
            }, function(err) {
                // An error occured. Show a message to the user
            }, function(position) {
                // Active updates of the position here
                // position.coords.latitude/longitude
                Data.updatePosition(position);
            });
        }

        ///////////////////////////////////////////////////
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
        $scope.hhmm = function() {
            // console.log(Data.getTime());
            return Data.getTime();
        };
        $scope.range = localStorage.getItem('filterRange') || 10;
        $scope.switchTab = function(index) {
            var tab = angular.element(document.querySelector('.js-tabbed-menu'));
            var content = angular.element(document.querySelector('.tab-container'));
            tab.children().removeClass('tabbed-active');
            content.children().css({
                display: 'none'
            });
            if (index === 'showtimes') {
                angular.element(tab.children()[0]).addClass('tabbed-active');
                content.children()[0].style.display = 'block';
            } else if (index === 'synopsis') {
                angular.element(tab.children()[1]).addClass('tabbed-active');
                content.children()[1].style.display = 'block';
            }
        };
        $scope.favorite = function(id) {
            Data.updateFavoriteFilms(id);
        };
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

myApp.controller('CinemaDetailCtrl', ['$scope', '$filter', '$stateParams', 'fetchData', 'Data', 'Helper',
    function($scope, $filter, $stateParams, fetchData, Data, Helper) {
        $scope.id = $stateParams.id;
        $scope.thisCinema = function() {
            var data = {};
            data = $filter('findObjById')($scope.id, Data.data.cinemas);
            return data;
        };
        $scope.go = function(path) {
            Helper.go(path);
            // have no idea why $location wouldn't work
        };
        $scope.showMap = (function() {
            // get latlng of the cinema
            // init
            var map = new GoogleMap($scope.thisCinema().lat, $scope.thisCinema().lng);
            map.initialize();
        })();
        $scope.showtimes = $filter('findShowtimeByCinemaId')($scope.id);
        $scope.findObjById = function(id) {
            return $filter('findObjById')(id, Data.data.films);
        };
        $scope.hhmm = function() {
            // console.log(Data.getTime());
            return Data.getTime();
        };
        // console.log($scope.showtimes);
    }
]);

myApp.controller('FavoritesCtrl', ['$scope', 'fetchData', 'Data',
    function($scope, fetchData, Data) {
    }
]);

myApp.controller('SettingsCtrl', ['$scope', '$ionicPopup', 'fetchData', 'Data', '$cordovaSocialSharing', '$state',
    function($scope, $ionicPopup, fetchData, Data, $cordovaSocialSharing, $state) {
        $scope.filterRange = localStorage.getItem('filterRange') || 10; // always = 10
        $scope.setNewRange = function(newval) {
            $scope.filterRange = newval;
            return Data.updateRange($scope.filterRange);
        };
        $scope.clearCache = function() {
            confirm('WARNING: Are you sure you want to reset?', function() {
                localStorage.clear();
                $state.go('loading');
            });
        };
    }
]);