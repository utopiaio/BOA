var logCtrl = app.controller('logCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.$emit('PAUSE');
  $scope.logCtrl = this;
}]);
