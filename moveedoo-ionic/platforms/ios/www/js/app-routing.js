// config routing
myApp.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('loading', {
                url: "/loading",
                templateUrl: "views/loading.html",
                controller: 'LoadingCtrl'
            })
            .state('landing', {
                url: "/landing",
                templateUrl: "views/landing.html",
                controller: 'LandingCtrl'
            })
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "tabs.html"
            })
            .state('tabs.films', {
                url: "/films",
                views: { // container
                    'films-tab': {
                        templateUrl: "views/films.html",
                        controller: 'FilmsCtrl'
                    }
                }
            })
            .state('tabs.filmDetail', {
                url: "/films/:id", // :id == string followed by hash
                views: { // container
                    'films-tab': { // in what view?
                        templateUrl: "views/film-detail.html",
                        controller: 'FilmDetailCtrl'
                    }
                }
            })
            .state('tabs.cinemas', {
                url: "/cinemas",
                views: {
                    'cinemas-tab': {
                        templateUrl: 'views/cinemas.html',
                        controller: 'CinemasCtrl'
                    }
                }
            })
            .state('tabs.cinemaDetail', {
                url: "/cinemas/:id", // :id == string followed by hash
                views: { // container
                    'cinemas-tab': { // in what view?
                        templateUrl: "views/cinema-detail.html",
                        controller: 'CinemaDetailCtrl'
                    }
                }
            })
            .state('tabs.favorites', {
                url: "/favorites",
                views: {
                    'favorites-tab': {
                        templateUrl: 'views/favorites.html',
                        controller: 'FavoritesCtrl'
                    }
                }
            })
            .state('tabs.settings', {
                url: "/settings",
                views: {
                    'settings-tab': {
                        templateUrl: 'views/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise("/loading");
    }
]);