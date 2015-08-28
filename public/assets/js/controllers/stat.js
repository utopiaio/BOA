;(function(angular) {
  'use strict';

  angular
    .module('app')
    .controller('StatController', StatController);

  StatController.$inject = ['$scope', '$http', 'branches'];

  function StatController($scope, $http, branches) {
    var vm = this;

    vm.query = {
      branch: "-1",
      range: {
        to: '',
        from: ''
      }
    };

    vm.reports = [];
    vm.branches = branches;

    vm.search = function() {
      $http
        .post('api/search', vm.query)
        .success(function(data) {
          vm.reports = data;

          angular.forEach(vm.reports, function(report, rindex) {
            vm.reports[rindex].age = {
              open: {
                age: moment(report.report_timestamp_open).fromNow(),
                pretty: moment(report.report_timestamp_open).format('MMMM, D YYYY, hh:mm A')
              },
              closed: {
                age: report.report_timestamp_close === null ? 'N/A' : moment(report.report_timestamp_close).fromNow(),
                pretty: report.report_timestamp_close === null ? 'N/A' : moment(report.report_timestamp_close).format('MMMM, D YYYY, hh:mm A')
              }
            };

            angular.forEach(vm.branches, function(branch, bindex) {
              if(report.report_branch === branch.branch_id) {
                vm.reports[rindex].branch = branch;
              }
            });
          });
        });
    };

    $scope.$emit('PAUSE');
  };
})(window.angular);
