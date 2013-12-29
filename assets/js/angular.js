var INITIATE_HUMANIZE = 0;
var HUMANIZE_THRESHOLD = 4;

angular.module ("BOA", []).config (["$routeProvider", function ($routeProvider) {
	$routeProvider.
		when ("/login", {templateUrl: "templates/login.html", controller: login}).
		when ("/:username/", {templateUrl: "templates/home.html", controller: home}).
		otherwise ({redirectTo: "/login"});
}]);



function login ($scope, $http, $location) {
	$scope.login_stat = "Login";

	$scope.credential = {
		username:	"",
		password:	""
	};

	$scope.submit = function () {
		// fixed a minor "bug"
		$scope.credential.password = CryptoJS.SHA256($("#PASSWORD").val()).toString();
		$scope.credential.username = $("#USERNAME").val();

		$scope.login_stat = "Checking...";
		$http ({
			method:	"POST",
			url:	"/login",
			data:	csrf ($scope.credential)
		}).success (function (data) {
			if (data.success) {
				$location.path ("/"+ $scope.credential.username + "/");
			}

			else {
				$scope.credential.username = "UNAUTHORIZED";
				$scope.credential.password = "UNAUTHORIZED";
				$scope.login_stat = "Login";
			}
		});
	};
}



function home ($scope, $http, $location, $rootScope) {
	$scope.current_user = {};
	$scope.branch_list = [];
	$scope.report_list = [];
	$scope.user_list = [];
	$scope.log_list = [];
	$scope.new_branch = {
		branch_name:	"",
		service_type:	"",
		speed:			"",
		access_type:	"",
		service_no:		"",
		ip_address:		""
	};
	$scope.new_user = {
		username:		"",
		password:		"",
		email:			"",
		super_duper:	false
	};
	$scope.report_branch = {};
	$scope.edit_branch = {};

	/// copying to clipboard
	/// @param {ip} String
	$scope.ping = function (ip) {
		console.log (ip);
	};

	/// SCROLL READY
	/// returns the current user --- from session, so don't try
	/// anything NASTY
	$scope.get_current_user = function () {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "CURRENT_USER"})
		}).success (function (data) {
			$scope.current_user = data;

			if (++INITIATE_HUMANIZE === HUMANIZE_THRESHOLD) {
				$scope.humanize();
			}
		});
	};

	/// SCROLL READY
	/// calling this function will get us ALL the freaken' users
	$scope.get_user_list = function () {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "USER_LIST"})
		}).success (function (data) {
			if (data.error === undefined) {
				$scope.user_list = data;

				if (++INITIATE_HUMANIZE === HUMANIZE_THRESHOLD) {
					$scope.humanize();
				}
			}

			else {
				$location.path ("/login");
			}
		});
	};

	/// SCROLL READY
	/// and this will return all the branches
	$scope.get_branch_list = function () {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "BRANCH_LIST"})
		}).success (function (data) {
			if (data.error === undefined) {
				$scope.branch_list = data;

				if (++INITIATE_HUMANIZE === HUMANIZE_THRESHOLD) {
					$scope.humanize();
				}
			}

			else {
				$location.path ("/login");
			}
		});
	};

	/// SCROLL READY
	/// guess what this does
	$scope.get_log_list = function () {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "LOG_LIST"})
		}).success (function (data) {
			if (data.error === undefined) {
				$scope.log_list = data;

				if (++INITIATE_HUMANIZE === HUMANIZE_THRESHOLD) {
					$scope.humanize();
				}
			}

			else {
				$location.path ("/login");
			}
		});
	};

	/// SCROLL READY
	/// this function will be called at a "special" time - i.e. when all
	/// necessary data has been loaded we'll be good to go
	/// we'll be calling:
	/// $scope.get_branch_list();
	/// $scope.get_user_list();
	/// $scope.get_log_list();
	/// $scope.get_current_user();
	/// then POW! - let's get crackn' my WHITE American friend
	/// the order in which they are called doesn't matter - callbacks my son
	$scope.humanize = function () {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "REPORT_LIST"})
		}).success (function (data) {
			if (data.error === undefined) {
				// here come the for loops :)
				for (var i = 0, l1 = data.length; i < l1; i++) {
					// first thing is first --- that's what she said
					// we are going to be enabling the overlay 'close' iff
					// the reported report is OWNED by the current user AND
					// the report status is still OPEN
					data[i].show_overlay = (data[i].reported_by === $scope.current_user.id && data[i].status === "OPEN") ? true : false;

					// user_list
					for (var j = 0, l2 = $scope.user_list.length; j < l2; j++) {
						if (data[i].reported_by === $scope.user_list[j].id) {
							data[i].reported_by = $scope.user_list[j].username;
							break;
						}
					}

					// branch_list
					// here we'll also 'disable' the 'report' functionality if
					// the branch is OPENLY reported
					for (var k = 0, l3 = $scope.branch_list.length; k < l3; k++) {
						// replacing branch reference by it's name
						if (data[i].branch === $scope.branch_list[k].id) {
							data[i].branch_name = $scope.branch_list[k].branch_name;
							data[i].ts = moment(data[i].ts).format("llll") +" ("+ moment(data[i].ts).fromNow() +")";
							if (data[i].status === "CLOSED") {
								data[i].ts_close = moment(data[i].ts_close).format("llll") +" ("+ moment(data[i].ts_close).fromNow() +")";
							}
							break;
						}
					}
				}

				// log_list
				for (var m = 0, l4 = $scope.log_list.length; m < l4; m++) {
					for (n = 0, l5 = $scope.user_list.length; n < l5; n++) {
						if ($scope.log_list[m].user === $scope.user_list[n].id) {
							$scope.log_list[m].user = $scope.user_list[n].username;
							$scope.log_list[m].ts = moment ($scope.log_list[m].ts).format("llll") +" ("+ moment($scope.log_list[m].ts).fromNow() +")";
							break;
						}
					}
				}

				$scope.report_list = data;
				do_DOM_js();
			}

			else {
				$location.path ("/login");
			}
		});
	};

	/// this will assign a special class according to the status of the report
	/// @param {String} status
	/// @return {String}
	$scope.color_code = function (status) {
		return status === "OPEN" ? "open" : "closed";
	};

	/// SCROLL READY
	/// UPDATED
	/// you'll NEVER guess what this does
	$scope.save_new_branch = function () {
		$('#NEW_BRANCH').modal("hide");

		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "NEW_BRANCH", new_branch: $scope.new_branch})
		}).success (function (data) {
			// we have a new branch
			if (data.NEW_BRANCH !== undefined) {
				data.LOG.user = $scope.current_user.username;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				$scope.branch_list.splice (0, 0, data.NEW_BRANCH);
				$scope.log_list.splice (0, 0, data.LOG);
				$("#BRANCH_LIST, #LOG_LIST").getNiceScroll().resize();
			}

			// boo!
			else {
				console.log (data);
			}
		});
	};

	/// launches the new branch modal
	/// yep we're scope-ing ERYthing
	$scope.lauch_new_modal = function () {
		$('#NEW_BRANCH').modal();
	};

	/// this BEFORE launching the edit modal, copies the model in hand
	/// i.e. abooot to be edited and index so when we come back we'll know which
	/// index to update
	/// @param {Object} branch
	/// @param {Number} index
	$scope.edit_b = function (branch) {
		angular.copy (branch, $scope.edit_branch);
		$scope.edit_branch.service_no = Number ($scope.edit_branch.service_no);
		$("#EDIT_BRANCH").modal ("show");
	};

	/// SCROLL READY
	/// UPDATED
	/// FIXED
	/// this will send the update (i.e. edit) request to the server
	/// and sees what happens
	$scope.update_branch = function () {
		$('#EDIT_BRANCH').modal("hide");

		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "UPDATE_BRANCH", update_branch: $scope.edit_branch})
		}).success (function (data) {
			if (data.UPDATED_BRANCH !== undefined) {
				$($scope.branch_list).each (function (index, value) {
					if (value.id === data.UPDATED_BRANCH.id) {
						$scope.branch_list.splice (index, 1, data.UPDATED_BRANCH);
					}
				});

				data.LOG.user = $scope.current_user.username;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				$scope.log_list.splice (0, 0, data.LOG);
				$("#LOG_LIST, #BRANCH_LIST").getNiceScroll().resize();
			}
		});
	};

	/// UPDATED
	/// FIXED
	/// woo-woo-woo --- real talk
	/// @param {Object} branch
	/// @param {Number} index
	$scope.delete_b = function (branch) {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "DELETE_BRANCH", delete_branch: branch})
		}).success (function (data) {
			if (data.DELETED_BRANCH !== undefined) {
				$($scope.branch_list).each (function (index, value) {
					if (data.DELETED_BRANCH.id === value.id) {
						$scope.branch_list.splice (index, 1);
					}
				});

				data.LOG.user = $scope.current_user.username;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				$scope.log_list.splice (0, 0, data.LOG);
				$("#BRANCH_LIST, #LOG_LIST").getNiceScroll().resize();
			}
		});
	};

	/// FIXED --- an am just kidding - we're past that
	/// @param {Object} branch
	$scope.report_b = function (branch) {
		angular.copy (branch, $scope.report_branch);
		$("#REPORT_BRANCH").modal ("show");
	};

	/// SCROLL READY
	/// UPDATED
	$scope.rep_branch = function () {
		$("#REPORT_BRANCH").modal ("hide");

		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "OPEN_REPORT", branch: $scope.report_branch})
		}).success (function (data) {
			if (data.OPENED_BRANCH !== undefined) {
				data.OPENED_BRANCH.reported_by = $scope.current_user.username;
				data.OPENED_BRANCH.branch_name = $scope.report_branch.branch_name;
				data.OPENED_BRANCH.show_overlay = true;
				data.OPENED_BRANCH.ts = moment (data.OPENED_BRANCH.ts).format("llll") +" ("+ moment(data.OPENED_BRANCH.ts).fromNow() +")";
				data.LOG.user = $scope.current_user.username;
				$scope.report_list.splice (0, 0, data.OPENED_BRANCH);
				$scope.log_list.splice (0, 0, data.LOG);
				$("#REPORT_LIST, #LOG_LIST").getNiceScroll().resize();
			}
		});
	};


	/// SCROLL READY
	/// UPDATED
	/// FIXED
	/// yall must be felling me right now son
	/// @param {Object} report
	/// @param {Number} index
	$scope.close_report = function (report) {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "CLOSE_REPORT", report: report})
		}).success (function (data) {
			if (data.CLOSED_REPORT !== undefined) {
				// turns out the splicing is a little messy...
				// turns out it's not --- it's seems to be "working fine"
				// the lamest excuse EVER!
				data.LOG.user = data.CLOSED_REPORT.reported_by;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				data.CLOSED_REPORT.ts = moment (data.CLOSED_REPORT.ts).format("llll") +" ("+ moment(data.CLOSED_REPORT.ts).fromNow() +")";
				data.CLOSED_REPORT.ts_close = moment (data.CLOSED_REPORT.ts_close).format("llll") +" ("+ moment(data.CLOSED_REPORT.ts_close).fromNow() +")";

				$($scope.report_list).each (function (index, value) {
					if (value.id === data.CLOSED_REPORT.id) {
						$scope.report_list.splice (index, 1, data.CLOSED_REPORT);
					}
				});

				$scope.log_list.splice (0, 0, data.LOG);
				$("#LOG_LIST, #REPORT_LIST").getNiceScroll().resize();
			}
		});
	};

	/// SCROLL READY
	/// UPDATED
	/// NEW USER
	$scope.user_plus = function () {
		$scope.new_user.password = CryptoJS.SHA256($scope.new_user.password).toString();

		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "NEW_USER", new_user: $scope.new_user})
		}).success (function (data) {
			if (data.NEW_USER !== undefined) {
				data.LOG.user = $scope.current_user.username;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				$scope.user_list.splice (0, 0, data.NEW_USER);
				$scope.log_list.splice (0, 0, data.LOG);
				$scope.new_user = {
					username:		"",
					password:		"",
					email:			"",
					super_duper:	false
				};
				$("#LOG_LIST").getNiceScroll().resize();
			}
		});
	};

	/// SCROLL READY
	/// UPDATED
	/// Donald Trump - you're fired - or something...
	/// @param {Object} user
	$scope.delete_u = function (user) {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "DELETE_USER", delete_user: user})
		}).success (function (data) {
			if (data.DELETED_USER !== undefined) {
				$($scope.user_list).each (function (index, value) {
					if (data.DELETED_USER.id === value.id) {
						$scope.user_list.splice (index, 1);
					}
				});

				data.LOG.user = $scope.current_user.username;
				data.LOG.ts = moment (data.LOG.ts).format("llll") +" ("+ moment(data.LOG.ts).fromNow() +")";
				$scope.log_list.splice (0, 0, data.LOG);
				$("#LOG_LIST").getNiceScroll().resize();
			}
		});
	};

	/// logging out
	$scope.logout = function (user) {
		$http ({
			method:	"POST",
			url:	"/REST",
			data:	csrf ({mode: "LOG_OUT"})
		}).success (function (data) {
			if (data.logged_out) {
				$("#CONFIG").modal("hide");
				$location.path ("/login");
			}

			else {
				console.log (data);
			}
		});
	};

	$scope.three_musketeers = function () {
		$scope.get_user_list();
		$scope.get_branch_list();
		$scope.get_log_list();
		$scope.get_current_user();
		INITIATE_HUMANIZE = 0;
		HUMANIZE_THRESHOLD = 4;
	};

	// phew!
	$scope.three_musketeers();
};

login.$inject = ["$scope", "$http", "$location"];
home.$inject = ["$scope", "$http", "$location", "$rootScope"];
