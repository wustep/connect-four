var color = "yellow";
var aiMove;

function setupBoard() {
	$("#board").html("");
	for (var i = 1; i < 8; i++) {
		$("#board").append("<button class='place' id='place-"+i+"'></button>")
	}
	$("#board").append("<br>")
	$(".place").button({icons: { primary: "ui-icon-carat-1-s" }, text: false})
	$(".place").click(function() {
		var column = $(this).attr("id").split('-')[1];
		placePiece(column, color);
	});
	for (var i = 1; i < 43; i++) {
		$("#board").append("<div class='box'><div class='circle' id='circle-"+i+"'>"+i+"</div></div>");
		if (i % 7 == 0) {
			$("#board").append("<br>");
		}
	}
}

function setupTriggers() {
	$("#swap").button({icons: { primary: "ui-icon-transfer-e-w" }});
	$('#yellow, #red').button().click(function() {
		var against = $(this).attr("value") == "human" ? "AI" : "Human";
		$(this).attr("value", against.toLowerCase());
		$("span", this).html(against);
		checkDisable();
	});
	$('#reset').button({icons:{ primary: " ui-icon-refresh" }}).click(function() {
		setupBoard();
		checkDisable();
	});
	$('#swap').button().click(function() {
		swapNext();
	});
}

function swapNext() {
	$('#yellow, #red').toggleClass("next");
	color = $('.next').attr("id");
	checkDisable();
}

function placePiece(place, color) {
	var placed = false;
	if (place < 43 && !$("#circle-"+place).is('.yellow, .red')) { // Check valid and empty
		placed = true;
		$(".circle.last").removeClass("last");
		$("#circle-"+place).addClass(color + " last");
		if (placePiece((parseInt(place) + 7), color) == true) { // Try to place into slot below it and check
			$("#circle-"+place).removeClass(color + " last");
		} else {
			swapNext();
		}
	} 
	return placed;
}

function checkWon(player) { // Player "yellow" = 1, "red" = 2
	var board = generateBoard();
}

function checkDisable() {
	if ($('.next').attr('value') == "ai") {
		$('.place').button('disable');
		aiMove = setTimeout(function() { playAI() }, 3000);
	} else {
		$('.place').button("enable");
	}
}

function generateBoard() {
	var board = new Array(42).fill(0);
	$(".circle.yellow, .circle.red").each(function() {
		var id = $(this).attr("id").split('-')[1];
		var color = $(this).attr("class").match(/placed\-\w{1,}/)[0].split('-')[1] == "yellow" ? 1 : 2; // Let yellow be 1 and red be 2
		board[id] = color;
	});
	return board;
}

function checkFull() {
	var full = true;
	var i = 1;
	while (i < 8 && full) {
		if (!$('#circle-'+i).is(".yellow, .red")) full = false;
		i++;
	}
	return full;
}

function playAI() {
	if ($('.next').attr('value') == "ai") {
		var color = $('.next').attr('id');
		var placed = false;
		while (!placed && !checkFull()) {
			var rand = Math.floor((Math.random() * 7) + 1);
			placed = placePiece(rand, color);
		}
	}
}
/*
board[0] =  1  2  3  4  5  6  7
board[1] =  8  9 10 11 12 13 14
board[2] = 15 16 17 18 19 20 21
board[3] = 22 23 24 25 26 27 28
board[4] = 29 30 31 32 33 34 35
board[5] = 36 37 38 39 40 41 42 
 OR
board[x] = pos?
*/