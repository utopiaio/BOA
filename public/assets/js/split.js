;(function(angular) {
  'use strict';

  angular.module('ngSplit', []);

  angular
    .module('ngSplit')
    .filter('split', function() {
      return function(input) {
        return input ? input.match(/[0-9]{1,3}/g).join('-') : input;
      };
    })
})(window.angular);
