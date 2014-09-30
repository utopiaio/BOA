/*
 * 
 * 2013
 * Moe Szyslack
 * moe.duffdude@gmail.com
 * 
 */

/// @param {Object} data
/// @return {Object}
function csrf (data) {
	data._csrf = $("#csrf").val();
	return data;
}

/// this is where the nice scroll will be called
/// ONCE the DOM has loaded
function do_DOM_js () {
	$("#BRANCH_LIST, #REPORT_LIST").css ({
		"min-height":		($(window).height() - 52) + "px",
		"max-height":		($(window).height() - 52) + "px"
	});

	$("#LOG_LIST").css ({
		"min-height":		($(window).height() - 16) + "px",
		"max-height":		($(window).height() - 16) + "px"
	});

	$("#BRANCH_LIST").niceScroll ({
		zindex:				2,
		cursorcolor:		"#333333",
		cursorborder:		"1px solid #333333",
		cursorborderradius:	"0"
	});

	$("#REPORT_LIST").niceScroll ({
		zindex:				2,
		cursorcolor:		"#333333",
		cursorborder:		"1px solid #333333",
		cursorborderradius:	"0"
	});

	$("#LOG_LIST").niceScroll ({
		zindex:				2,
		cursorcolor:		"#333333",
		cursorborder:		"1px solid #333333",
		cursorborderradius:	"0"
	});
}
