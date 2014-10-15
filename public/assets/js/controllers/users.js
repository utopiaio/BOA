var usersCtrl = app.controller('usersCtrl', ['$scope', '$http', 'users', function ($scope, $http, users) {
  $scope.$emit('PAUSE');
  $scope.users = users;
  $scope.newUser = {
    user_username: '',
    user_password: '',
    user_access_type: 'NORMAL',
    user_suspended: false
  };
  $scope.user10_4 = {};

  $scope.$on('NEW_USER', function (event, newUser) {
    $scope.users.push(newUser);
    $scope.$digest();
  });

  $scope.$on('UPDATED_USER', function (event, updatedUser) {
    for (index in $scope.users) {
      if ($scope.users[index].user_id === updatedUser.user_id) {
        $scope.users[index] = updatedUser;
        $scope.$digest();
        break;
      }
    }
  });

  $scope.$on('DELETED_USER', function (event, deletedUserId) {
    for (index in $scope.users) {
      if ($scope.users[index].user_id === deletedUserId) {
        $scope.users.splice(index, 1);
        $scope.$digest();
        break;
      }
    }
  });

  this.newUserSubmit = function () {
    $http.post('api/users', $scope.newUser).success(function (data, status, headers, config) {
      $scope.users.push(data.newUser);
      $('#new-modal').modal('hide');
      $scope.newUser = {
        user_username: '',
        user_password: '',
        user_access_type: '',
        user_suspended: false
      };
    });
  };

  this.editUser = function (user) {
    $scope.user10_4 = angular.copy(user);
    $('#edit-user-modal').modal();
  };

  this.editUserSubmit = function () {
    $http.put('api/users/'+ $scope.user10_4.user_id, $scope.user10_4).success(function (data, status, headers, config) {
      for (index in $scope.users) {
        if ($scope.users[index].user_id === data.updatedUser.user_id) {
          $scope.users[index] = data.updatedUser;
          break;
        }
      }

      $('#edit-user-modal').modal('hide');
    });
  };

  this.deleteUserSubmit = function () {
    $http.delete('api/users/'+ $scope.user10_4.user_id).success(function (data, status, headers, config) {
      for (index in $scope.users) {
        if ($scope.users[index].user_id === data.deletedUserId) {
          $scope.users.splice(index, 1);
          break;
        }
      }

      $('#edit-user-modal').modal('hide');
    });
  };

  $scope.usersCtrl = this;

  // a couple of DOM bindings to make the page look pretty
  $('.user-container').css({
    'height': $(window).height() - 80 + 'px'
  });

  $('.user-container').niceScroll({
    zindex: 1,
    cursorcolor: 'rgba(51, 51, 51, 0.75)',
    cursorwidth: '4px',
    cursorborder: '0px solid rgba(0, 0, 0, 0)',
    cursorborderradius: '0px',
    hidecursordelay: 1000
  });

  $(window).resize(function () {
    $('.user-container').css({
      'height': $(window).height() - 80 + 'px'
    });
  });
}]);



usersCtrl.users = function ($q, $http, $location) {
  var defer = $q.defer();

  $http.get('api/users').success(function (data, status, headers, config) {
    defer.resolve(data);
  }).error(function (data, status, headers, config) {
    defer.reject(data);
    $location.path('/login');
  });

  return defer.promise;
};
