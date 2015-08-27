;(function(angular) {
  'use strict';

  angular
    .module('app')
    .controller('LogController', LogController);

  LogController.$inject = ['$scope', '$http'];

  function LogController($scope, $http) {
    var vm = this;
    $scope.$emit('PAUSE');
  }
})(window.angular);
