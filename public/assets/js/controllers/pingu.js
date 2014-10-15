var pinguCtrl = app.controller('pinguCtrl', ['$rootScope', '$scope', '$http', '$location', '$interval', 'branches', 'reports', function ($rootScope, $scope, $http, $location, $interval, branches, reports) {
  $scope.branches = branches;
  $scope.reports = reports;
  $scope.newBranch = {
    branch_name:            '',
    branch_ip:              '',
    branch_service_number:  '',
    branch_service_type:    'Data',
    branch_access_type:     'ADSL',
    branch_bandwidth:       '512 Kbps'
  };
  $scope.report = {
    branch_id:  '',
    ticket:     '',
    alert:      false
  };
  $scope.branch10_4 = {};
  $scope.report10_4 = {};

  // socket connection is handled via big daddy i.e. appCtrl
  // everyone that is interested should be on the listen
  // this i think creates a neat interaction logic
  $scope.$on('NEW_BRANCH', function (event, newBranch) {
    $scope.branches.push(newBranch);
    $scope.$digest();
  });

  // we'll look through the list and update with the new info
  $scope.$on('UPDATED_BRANCH', function (event, updatedBranch) {
    for (index in $scope.branches) {
      if ($scope.branches[index].branch_id === updatedBranch.branch_id) {
        $scope.branches[index] = updatedBranch;
        $scope.$digest();
        break;
      }
    }

    $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
  });

  // branch deleted
  $scope.$on('DELETED_BRANCH', function (event, deletedBranchId) {
    for (index in $scope.branches) {
      if ($scope.branches[index].branch_id === deletedBranchId) {
        $scope.branches.splice(index, 1);
        $scope.$digest();
        break;
      }
    }
  });

  // ping result shows 100% loss
  $scope.$on('BLACK_HAWK_DOWN', function (event, data) {
    $scope.branch10_4 = data.branch;
    // not in-use for the time being
    // but it's good to know it's there
    $scope.result = data.result;
    $scope.report = {
      branch_id:  data.branch.branch_id,
      ticket:     '',
      alert:      false
    };
    $scope.$digest();
    $('#black-hawk-down').modal();
  });

  // there's a logic collision
  // the app doesn't differentiate between a modal launched via ping
  // or manually, causing a report modal to close
  // on both situations --- this is an official TODO
  $scope.$on('AC-DC', function (event, data) {
    $('#black-hawk-down').modal('hide');
    $scope.report = {
      branch_id:  '',
      ticket:     '',
      alert:      false
    };
    $scope.reports.push(data);
    $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
    $scope.$digest();
  });

  $scope.$on('BLACK_HAWK_UP', function (event, data) {
    for (report in $scope.reports) {
      if ($scope.reports[report].report_id === data.report.report_id) {
        $scope.reports[report] = data.report;
        break;
      }
    }

    $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
    $scope.$digest();
  });

  $scope.$on('UPDATED_REPORT', function (event, updatedReport) {
    for (index in $scope.reports) {
      if ($scope.reports[index].report_id === updatedReport.report_id) {
        $scope.reports[index] = updatedReport;
        $scope.$digest();
        break;
      }
    }

    $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
  });

  $scope.$on('DELETED_REPORT', function (event, deletedReportId) {
    for (index in $scope.reports) {
      if ($scope.reports[index].report_id === deletedReportId) {
        $scope.reports.splice(index, 1);
        $scope.$digest();
        break;
      }
    }
  });

  // whenever this function is called it'll go through the list of reports and
  // add the referenced branch in the report
  // PS
  // this freaken' thing should be called like on ERY possible update so that
  // the list stays updated --- we've come too far just to half-ass it
  //
  // double PS
  // i know naming the function `match` is not advised
  //
  // with no further a-do, let's get it on!
  this.match = function () {
    for (report in $scope.reports) {
      for (branch in $scope.branches) {
        if ($scope.reports[report].report_branch === $scope.branches[branch].branch_id) {
          $scope.reports[report].branch = $scope.branches[branch];
          $scope.reports[report].age = {
            open: {
              age: moment($scope.reports[report].report_timestamp_open).fromNow(),
              pretty: moment($scope.reports[report].report_timestamp_open).format('MMMM, D YYYY, hh:mm A')
            },
            closed: {
              age: $scope.reports[report].report_timestamp_close === null ? 'N/A' : moment($scope.reports[report].report_timestamp_close).fromNow(),
              pretty: $scope.reports[report].report_timestamp_close === null ? 'N/A' : moment($scope.reports[report].report_timestamp_close).format('MMMM, D YYYY, hh:mm A')
            }
          };

          break;
        }
      }
    }

    if ($scope.$$phase === null) {
      $scope.$digest();
    }
  };

  this.newBranchSubmit = function () {
    $http.post('api/branches', $scope.newBranch).success(function (data, status, headers, config) {
      $scope.branches.push(data.newBranch);
      $('#new-modal').modal('hide');
      $scope.newBranch = {
        branch_name:            '',
        branch_ip:              '',
        branch_service_number:  '',
        branch_service_type:    'Data',
        branch_access_type:     'ADSL',
        branch_bandwidth:       '512 Kbps'
      };
    });
  };

  this.editBranchSubmit = function () {
    $http.put('api/branches/'+ $scope.branch10_4.branch_id, $scope.branch10_4).success(function (data, status, headers, config) {
      for (index in $scope.branches) {
        if ($scope.branches[index].branch_id === data.updatedBranch.branch_id) {
          $scope.branches[index] = data.updatedBranch;
          break;
        }
      }

      $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
      $('#edit-branch-modal').modal('hide');
    });
  };

  this.deleteBranchSubmit = function () {
    // upon success, we'll go after the delete branch and well...
    // splice the shit out it
    // the rest will be informed to do the same via 'DELETED_BRANCH'
    $http.delete('api/branches/'+ $scope.branch10_4.branch_id).success(function (data, status, headers, config) {
      for (index in $scope.branches) {
        if ($scope.branches[index].branch_id === data.deletedBranchId) {
          $scope.branches.splice(index, 1);
          break;
        }
      }

      $('#edit-branch-modal').modal('hide');
    });
  };

  // this is called when the form is added
  // on success, we'll send the ticket to ERYone via socket
  this.report = function () {
    $http.post('api/reports', $scope.report);
  };

  // you know it
  this.editReport = function (report) {
    $scope.report10_4 = angular.copy(report);
    $('#edit-report-modal').modal();
  };

  this.editReportsubmit = function () {
    $http.put('api/reports/'+ $scope.report10_4.report_id, $scope.report10_4).success(function (data, status, headers, config) {
      for (index in $scope.reports) {
        if ($scope.reports[index].report_id === data.updatedReport.report_id) {
          $scope.reports[index] = data.updatedReport;
          break;
        }
      }

      $scope.pinguCtrl.match(); // making sure ERYthing is up-to date
      $('#edit-report-modal').modal('hide');
    });
  };

  // am sure you see a pattern emerging here
  this.deleteReportSubmit = function () {
    $http.delete('api/reports/'+ $scope.report10_4.report_id).success(function (data, status, headers, config) {
      for (index in $scope.reports) {
        if ($scope.reports[index].report_id === data.deletedReportId) {
          $scope.reports.splice(index, 1);
          break;
        }
      }

      $('#edit-report-modal').modal('hide');
    });
  };

  // we're going to use California's five-o codes
  this.cali = function (branch, mode) {
    $scope.branch10_4 = angular.copy(branch);

    switch(mode) {
      // kidnapping attempt
      // user just wants her number --- riiiiiiiiiiiiiiight
      case '207A':
        $('#edit-branch-modal').modal();
      break;

      // drunk
      // user JUST wants to report a branch
      // PS
      // this is where the logic collision occurs, black hawk down will
      // be launched --- which can be closed with AC-DC event is emitted
      case '390':
        $scope.report = {
          branch_id:  $scope.branch10_4.branch_id,
          ticket:     '',
          alert:      false
        };
        $('#black-hawk-down').modal();
      break;
    }
  };

  // for re-usability purposes we're going to "tweak" the ip address
  // and yes the server WILL make sure it's an IP so we don't get shocked ;)
  this.ping = function (model, mode) {
    var ip = '';

    if (mode === 'PING_BRANCH') {
      ip = model.branch_ip.split(/\./);
    } else if (mode === 'PING_REPORT') {
      // we're going to look for that freaken' branch and THEN...
      // ping it and ping it HARD
      ip = model.branch.branch_ip.split(/\./);
    }

    for (index in ip) {
      ip[index] = Number(ip[index]);
    }

    ip[3]++; // well it's an IP ain't it
    ip = ip.join('.');

    // Pingu will get back to us (or ERYone) via socket
    $http.post('api/ping', {ip: ip, branch: model, mode: mode});
  };

  // we'll run the match one time, so we're up and running
  this.match();
  $scope.pinguCtrl = this;

  // this makes sure time ages are updated every minute
  // a few seconds ago becomes 1 minute ago :)
  // i don't know weather or not i should have used emit instead of $rootScope
  $rootScope.ageUpdate = $interval(function () {
    $scope.pinguCtrl.match();
  }, 60000);

  // a couple of DOM bindings to make the page look pretty
  $('.branch-container, .report-container').css({
    'height': $(window).height() - 80 + 'px'
  });

  $('.branch-container, .report-container').niceScroll({
    zindex: 1,
    cursorcolor: 'rgba(51, 51, 51, 0.75)',
    cursorwidth: '4px',
    cursorborder: '0px solid rgba(0, 0, 0, 0)',
    cursorborderradius: '0px',
    hidecursordelay: 1000
  });

  $(window).resize(function () {
    $('.branch-container, .report-container').css({
      'height': $(window).height() - 80 + 'px'
    });
  });

}]);



pinguCtrl.socket = function ($q, $rootScope, $http, $location) {
  var defer = $q.defer();

  // making sure our session exits
  $http.get('api/login').success(function (data, status, headers, config) {
    // if all is good, we'll [re]attempt socket connection
    $rootScope.connect();
    defer.resolve();
  }).error(function (data, status, headers, config) {
    // ABANDON SHIP!
    $location.path('/login');
    // a bit of Star Wars shit right there
    // i just made a lot of Nerdemies (Nerd + enemies) - patent pending
    defer.reject({msg: 'session found not, Luke bad'});
  });

  return defer.promise;
};



pinguCtrl.branches = function ($q, $http) {
  var defer = $q.defer();

  $http.get('api/branches').success(function (data, status, headers, config) {
    defer.resolve(data);
  }).error(function (data, status, headers, config) {
    defer.reject(data);
  });

  return defer.promise;
};



pinguCtrl.reports = function ($q, $http) {
  var defer = $q.defer();

  $http.get('api/reports').success(function (data, status, headers, config) {
    for (report in data) {
      data[report].age = {
        open: {
          age: moment(data[report].report_timestamp_open).fromNow(),
          pretty: moment(data[report].report_timestamp_open).format('MMMM D, YYYY, hh:mm A')
        },
        closed: {
          age: data[report].report_timestamp_close === null ? 'N/A' : moment(data[report].report_timestamp_close).fromNow(),
          pretty: data[report].report_timestamp_close === null ? 'N/A' : moment(data[report].report_timestamp_close).format('MMMM D, YYYY, hh:mm A')
        }
      };
    }

    defer.resolve(data);
  }).error(function (data, status, headers, config) {
    defer.reject(data);
  });

  return defer.promise;
};
