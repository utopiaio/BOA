;(function(angular) {
  'use strict';

  angular
    .module('app')
    .controller('StatController', StatController);

  StatController.$inject = ['$scope', '$http'];

  function StatController($scope, $http) {
    $scope.$emit('PAUSE');
    var vm = this;

    vm.range = {
      to: '',
      from: ''
    };
  };
})(window.angular);
