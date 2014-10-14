var usersCtrl = app.controller('usersCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.$emit('PAUSE');
  $scope.usersCtrl = this;
}]);
