var loginCtrl = app.controller('loginCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.credentials = {
    username: '',
    password: ''
  };

  this.submit = function () {
    // we're "manually" binding Angular model on submission because
    // angular does NOT listen to browser form auto-complete --- YET!
    $scope.credentials.username = $('#username').val();
    $scope.credentials.password = $('#password').val();

    $http.post('api/login', $scope.credentials).success(function (data, status, headers, config) {
      console.log(data);
    }).error(function (data, status, headers, config) {
      console.log(data);
    });

    console.log('submitting...');
  };

  $scope.loginCtrl = this;
}]);
