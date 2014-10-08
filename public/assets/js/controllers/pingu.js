var pinguCtrl = app.controller('pinguCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
  // GET
  $http.get('api/login').success(function (data, status, headers, config) {
  }).error(function (data, status, headers, config) {
    console.log(data);
    $location.path('/login');
  });

  // POST
  $http.post('api/login', {username: 'moe'}).success(function (data, status, headers, config) {
  }).error(function (data, status, headers, config) {
  });

  // DELETE
  $http.delete('api/login', {username: 'moe'}).success(function (data, status, headers, config) {
  }).error(function (data, status, headers, config) {
  });

  $scope.pinguCtrl = this;
}]);
