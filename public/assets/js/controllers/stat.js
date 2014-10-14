var statCtrl = app.controller('statCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.$emit('PAUSE');
  $scope.statCtrl = this;
}]);
