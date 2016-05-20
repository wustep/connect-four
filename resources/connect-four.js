var color = "yellow";
var aiMove;

function setupBoard() {
	$("#board").html("");
	for (var i = 0; i < 7; i++) {
		$("#board").append("<button class='place' id='place-"+i+"'></button>")
	}
	$("#board").append("<br>")
	$(".place").button({icons: { primary: "ui-icon-carat-1-s" }, text: false})
	$(".place").click(function() {
		var column = $(this).attr("id").split('-')[1];
		placePiece(column);
	});
	for (var i = 5; i >= 0; i--) { // column x row
		for (var j = 0; j < 7; j++) {
			var id = j + "-" + i;
			$("#board").append("<div class='box'><div class='circle' id='circle-"+id+"'>"+id+"</div></div>");
		}
		$("#board").append("<br>");
	}
	$('.circle').hover(
	function() {
		if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red')) {
			$(this).addClass("h-"+color + " hover");
		}
	},
	function() {
		if ($(this).hasClass("hover")) {
			$(this).removeClass("h-"+color + " hover");
		}
	}
	).click(
	function() {
		if ($('.next').attr('value') != "ai" && $(this).hasClass('hover') && !$(this).is('.yellow, .red')) {
			var id = $(this).attr('id').substring(7);
			placePiece(id);
			$(this).removeClass("h-yellow h-red");
			if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red')) {
				$(this).addClass("h-"+color + " hover");
			}
		}
	});
}

function setupTriggers() {
	$("#swap").button({icons: { primary: "ui-icon-transfer-e-w" }});
	$('#yellow, #red').button().click(function() {
		var against = $(this).attr("value") === "human" ? "AI" : "Human";
		$(this).attr("value", against.toLowerCase());
		$("span", this).html(against);
		if (checkDisable()) {
			aiMove = setTimeout(function() { playAI(); }, 1000);
		}
	});
	$('#reset').button({icons:{ primary: " ui-icon-refresh" }}).click(function() {
		setupBoard();
		checkDisable();
		clearTimeout(aiMove);
	});
	$('#swap').button().click(function() {
		swapNext();
	});
}

function swapNext() {
	$('#yellow, #red').toggleClass("next");
	color = $('.next').attr("id");
	if (checkDisable()) {
		aiMove = setTimeout(function() { playAI(); }, 1000);
	}
}

// Either use placePiece('1-5') or just placePiece(5)
function placePiece(place) {
	var column = place.toString().indexOf('-') != -1 ? place.split('-')[0] : place;
	var row = place.toString().indexOf('-') != -1 ? place.split('-')[1] : 5;
	var placeColor = color;
	var placed = false;
	var id = column + "-" + row;
	if (parseInt(row) >= 0 && ($("#circle-"+id).hasClass('hover') || !$("#circle-"+id).is('.yellow, .red'))) { // Check valid and empty
		placed = true;
		if (!placePiece(column + "-" + (parseInt(row) - 1))) { // Try to place into slot below it and check
			$(".circle.last").removeClass("last");
			$("#circle-"+id).addClass(placeColor + " last");
			swapNext();
		}
	}
	return placed;
}

function checkWon(player) { // Player "yellow" = 1, "red" = 2
	var board = generateBoard();
}

function checkDisable() { // Check if game needs to disable drop buttons
	var disabled = false;
	if (checkFull() || $('.next').attr('value') === "ai") {
		disabled = true;
		$('.place').button('disable');
	} else {
		for (var i = 0; i < 7; i++) {
			if (checkFull(i)) {
				$('#place-' + i).button('disable');
			} else {
				$('#place-' + i).button('enable');
			}
		}
	}
	return disabled;
}

function generateBoard() {
	var board = new Array(7);
	for (var i = 0; i < 7; i++) {
		board[i] = new Array(6).fill(0);
	}
	$(".circle.yellow, .circle.red").each(function() {
		if (!$(this).hasClass('hover')) {
			var color = $(this).hasClass("yellow") ? 1 : 2;
			var id = $(this).attr('id').split('-');
			var column = id[1];
			var row = id[2];
			board[column][row] = color;
		}
	});
	return board;
}

function checkFull(col = -1) {
	var id = ((col == -1) ? ".circle:not(.yellow, .red)" : "div[id^='circle-"+col+"-']:not(.yellow, .red)");
	console.log(col + ":" + $(id).length);
	return $(id).length == 0;
}

function playAI() {
	if ($('.next').attr('value') === "ai") {
		var color = $('.next').attr('id');
		var placed = false;
		while (!placed && !checkFull()) {
			var rand = Math.floor((Math.random() * 7));
			placed = placePiece(rand);
		}
	}
}
/*
 board[0][1][2][3][4][5][6]
[0] -  1  2  3  4  5  6  7 
[1] -  8  9 10 11 12 13 14 
[2] - 15 16 17 18 19 20 21
[3] - 22 23 24 25 26 27 28
[4] - 29 30 31 32 33 34 35
[5] - 36 37 38 39 40 41 42
*/