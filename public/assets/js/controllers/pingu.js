var pinguCtrl = app.controller('pinguCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
  $http.get('api/login').success(function (data, status, headers, config) {
    $scope.connect();
  }).error(function (data, status, headers, config) {
    $location.path('/login');
  });

  /*
  // POST
  $http.post('api/login', {username: 'moe', password: 'moe@23'}).success(function (data, status, headers, config) {
  }).error(function (data, status, headers, config) {
  });

  // DELETE
  $http.delete('/api/users').success(function (data, status, headers, config) {
  }).error(function (data, status, headers, config) {
  });
  */

  $scope.pinguCtrl = this;


  // a couple of DOM bindings to make the page look pretty
  $('.branch-container, .report-container').css({
    'height': $(window).height() - 80 + 'px'
  });

  $('.branch-container, .report-container').niceScroll({
    zindex: 9e3,
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
