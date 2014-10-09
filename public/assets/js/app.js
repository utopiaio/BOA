var app = angular.module('app', ['ngRoute', 'ngAnimate']);



app.controller('appCtrl', ['$rootScope', '$http', '$q', '$location', function ($rootScope, $http, $q, $location) {
  $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
    console.error(rejection);
  });

  $rootScope.$on('$routeChangeStart', function (event, target) {
  });

  $rootScope.$on('$routeChangeSuccess', function (event, target) {
  });

  $rootScope.io = null;

  $rootScope.connect = function () {
    if ($rootScope.io === null) {
      $rootScope.io = io.connect();

      $rootScope.io.on('connect', function () {
        iPNotify({text: 'hurray, socket connection established', type: 'info'});
      });

      $rootScope.io.on('message', function (data) {
        if (data.notify !== undefined) {
          iPNotify(data.notify);
        }
      });

      $rootScope.io.on('error', function (data) {
        iPNotify({text: 'umm, what\'s up Doc?', type: 'error'});
      });
    }
  };

  $rootScope.appCtrl = this;
}]);



app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://boa*.herokuapp.org/**'
  ]);
});



app.config(function ($routeProvider, $httpProvider, $locationProvider) {
  $httpProvider.interceptors.push(function ($rootScope, $q) {
    return {
     'request': function(config) {
        $rootScope.httpInProgress = true;
        return config;
      },

      'response': function(response) {
        $rootScope.httpInProgress = false;
        if (response.data.notify !== undefined) {
          iPNotify(response.data.notify)
        }

        return response;
      },

      'responseError': function (rejection) {
        $rootScope.httpInProgress = false;

        if (rejection.data.notify !== undefined) {
          iPNotify(rejection.data.notify)
        }

        return $q.reject(rejection);
      }
    };
  });



  $routeProvider.when('/', {
    templateUrl: 'templates/pingu.html',
    controller: 'pinguCtrl'
  }).

  when('/login', {
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  }).

  when('/stat', {
    templateUrl: 'templates/stat.html',
    controller: 'statCtrl'
  }).

  when('/users', {
    templateUrl: 'templates/users.html',
    controller: 'usersCtrl'
  }).

  when('/log', {
    templateUrl: 'templates/log.html',
    controller: 'logCtrl'
  }).

  otherwise({
    redirectTo: '/login'
  });

  $locationProvider.html5Mode(true);
});
