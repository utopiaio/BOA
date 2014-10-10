var app = angular.module('app', ['ngRoute', 'ngAnimate', 'ngTouch']);



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

        switch(data.code) {
          case 'NEW_BRANCH':
            $rootScope.$broadcast('NEW_BRANCH', data.newBranch);
          break;

          case 'UPDATED_BRANCH':
            $rootScope.$broadcast('UPDATED_BRANCH', data.updatedBranch);
          break;

          case 'DELETED_BRANCH':
            $rootScope.$broadcast('DELETED_BRANCH', data.deletedBranchId);
          break;

          case 'BLACK_HAWK_DOWN':
            $rootScope.$broadcast('BLACK_HAWK_DOWN', data.data);
          break;

          case 'I-GOT-IT':
            $('#black-hawk-down').modal('hide');
          break;

          case 'AC-DC':
            $rootScope.$broadcast('AC-DC', data.report);
          break;
        };
      });

      $rootScope.io.on('error', function (data) {
        iPNotify({text: 'umm, what\'s up Doc?', type: 'error'});
      });
    }
  };



  $rootScope.$on('I-GO-IT', function (event, branchToBeReported) {
    $rootScope.io.emit('I-GOT-IT', branchToBeReported);
  });



  $rootScope.appCtrl = this;


  $('.menu a, .menu button').click(function (e) {
    $('.menu a, .menu button').removeClass('activex');
    $(this).addClass('activex');
  });

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
