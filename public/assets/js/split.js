angular.module('ngSplit', []).filter('split', function () {
  return function (input) {
    if (input) {
      return input.match(/[0-9]{1,3}/g).join('-');
    }
  };
});
