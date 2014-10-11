var pinguCtrl = app.controller('pinguCtrl', ['$scope', '$http', '$location', 'branches', 'reports', function ($scope, $http, $location, branches, reports) {
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
  $scope.editBranch = {};

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
    $('#black-hawk-down').modal();
    $scope.pingedBranch = data.branch;
    $scope.result = data.result;
    $scope.report = {
      branch_id:  data.branch.branch_id,
      ticket:     '',
      alert:      false
    };
    $scope.$digest();
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
    $scope.$digest();
  });

  // this is called when the form is added
  // on success, we'll send the ticket to ERYone via socket
  this.report = function () {
    $http.post('api/reports', $scope.report);
  };

  this.newBranchsubmit = function () {
    $http.post('api/branches', $scope.newBranch).success(function (data, status, headers, config) {
      $scope.branches.push(data.newBranch);
      $('#new-branch-modal').modal('hide');
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

  this.editBranch = function (branch) {
    $scope.editBranch = angular.copy(branch);
    $('#edit-branch-modal').modal();
  };

  this.deleteBranch = function () {
    // upon success, we'll go after the delete branch and well...
    // splice the shit out it
    // the rest will be informed to do the same via 'DELETED_BRANCH'
    $http.delete('api/branches/'+ $scope.editBranch.branch_id).success(function (data, status, headers, config) {
      for (index in $scope.branches) {
        if ($scope.branches[index].branch_id === data.deletedBranchId) {
          $scope.branches.splice(index, 1);
          break;
        }
      }

      $('#edit-branch-modal').modal('hide');
    });
  };

  // for re-usability purposes we're going to "tweak" the ip address
  // and yes the server WILL make sure it's an IP so we don't get shocked ;)
  this.ping = function (branch) {
    var ip = branch.branch_ip.split(/\./);

    for (index in ip) {
      ip[index] = Number(ip[index]);
    }

    ip[3]++; // well it's an IP ain't it
    ip = ip.join('.');

    // Pingu will get back to us (or ERYone) via socket
    $http.post('api/ping', {ip: ip, branch: branch});
  };

  this.editBranchsubmit = function () {
    $http.put('api/branches/'+ $scope.editBranch.branch_id, $scope.editBranch).success(function (data, status, headers, config) {
      for (index in $scope.branches) {
        if ($scope.branches[index].branch_id === data.updatedBranch.branch_id) {
          $scope.branches[index] = data.updatedBranch;
          break;
        }
      }

      $('#edit-branch-modal').modal('hide');
    });
  };

  $scope.pinguCtrl = this;


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
    defer.resolve(data);
  }).error(function (data, status, headers, config) {
    defer.reject(data);
  });

  return defer.promise;
};
