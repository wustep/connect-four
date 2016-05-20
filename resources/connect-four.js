var color = "yellow";
var aiMove;

// setupBoard - Set up or reset the game board and placement buttons
function setupBoard() {
	$("#board").html("");
	for (var i = 0; i < 7; i++) { // Add place buttons
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
}

// setupTriggers - Set up various button and div, hover/click triggers
function setupTriggers() {
	$('#reset').button({icons:{ primary: " ui-icon-refresh" }}).click(function() {
		setupBoard();
		checkDisable();
		clearTimeout(aiMove);
		aiMove = setTimeout(function() { playAI(); }, 1000);
	});
	$('#yellow, #red').button().click(function() {
		var against = $(this).attr("value") === "human" ? "AI" : "Human";
		$(this).attr("value", against.toLowerCase());
		$("span", this).html(against);
		if (checkDisable()) {
			aiMove = setTimeout(function() { playAI(); }, 1000);
		}
	});
	$("#swap").button({icons: { primary: "ui-icon-transfer-e-w" }}).click(function() {
		swapNext();
	});
	$('#board').on({
		mouseenter: function() {
			if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red')) {
				$(this).addClass("h-"+color + " hover");
			}
		},
		mouseleave: function() {
			if ($(this).hasClass("hover")) {
				$(this).removeClass("h-"+color + " hover");
			}
		},
		click: function() { // TODO - BUG: when clicking the piece (rather than dropping or click-dropping), the checkWin doesn't use the new board state
			if ($('.next').attr('value') != "ai" && $(this).hasClass('hover') && !$(this).is('.yellow, .red')) {
				var id = $(this).attr('id').substring(7);
				placePiece(id);
				$(this).removeClass("h-yellow h-red");
				if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red')) {
					$(this).addClass("h-"+color + " hover");
				}
			}
		}
	}, ".circle");
}

// swapNext - Swap to the next player, disable or play AI if needed
function swapNext() {
	if (checkWin(color)) {
		console.log("Winner: " + color);
	} 
	$('#yellow, #red').toggleClass("next");
	color = $('.next').attr("id");
	if (checkDisable()) {
		aiMove = setTimeout(function() { playAI(); }, 1000);
	}
}

// placePiece(place) - Play piece in place (either column "5" or id "5-5")
function placePiece(place) {
	var column = place.toString().indexOf('-') != -1 ? place.split('-')[0] : place;
	var row = place.toString().indexOf('-') != -1 ? place.split('-')[1] : 5;
	var placed = false;
	var id = column + "-" + row;
	if (parseInt(row) >= 0 && !$("#circle-"+id).is('.yellow, .red')) { // Check valid and empty
		placed = true;
		var placeColor = color;
		if (!placePiece(column + "-" + (parseInt(row) - 1))) { // If next placement failed, use this one
			$(".circle.last").removeClass("last");
			$("#circle-"+id).addClass(placeColor + " last");
			swapNext();
		}
	}
	return placed;
}

// checkDisable - Check and disable place buttons, returning true if all are disabled (full or AI to play)
function checkDisable() {
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

// checkFull(col) - Check column 'col' or entire board and return true if full
function checkFull(col = -1) {
	var id = ((col == -1) ? ".circle:not(.yellow, .red)" : "div[id^='circle-"+col+"-']:not(.yellow, .red)");
	return $(id).length == 0;
}

// playAI - Make the AI move
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

// generateBoard(code, addRow) - generate a bitboard for player code
// code: 0 = both, 1 = yellow, 2 = red
// Board will return array of 0/1/2 OR 0/1 for yellow/red boards
// addRow adds an additional row for purposes of converting to long / solution checking
function generateBoard(code = 0) {
	var board = new Array(7);
	for (var i = 0; i < 7; i++) {
		board[i] = new Array(6).fill(0);
	}
	var colors = ".circle.";
	if (code == 0) colors += "yellow, .circle.red";
	else if (code == 1) colors += "yellow";
	else if (code == 2) colors += "red";
	$(colors).each(function() {
		if (!$(this).hasClass('hover')) {
			var bit = ($(this).hasClass("yellow") || code != 0 ? 1 : 2); 
			var id = $(this).attr('id').split('-');
			var column = id[1];
			var row = id[2];
			board[column][row] = bit;
		}
	});
	return board;
}

// Convert bitboard array to its decimal representation
function boardToDecimal(board) {
	var decimal = 0;
	var rows = 6;
	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 6; j++) {
			if (board[i][j] == 1) {
				decimal += Math.pow(2, 7*i + j);
			}
		}
	}
	return decimal;
}

// hasWon - Given a player's board, check if they are the winner - Adapted from John Tromp's method - https://tromp.github.io/c4/c4.html
function hasWon(board) {	
	var diag1 = bAnd(board, board * Math.pow(2, -6)); // diagonal check
	var horz = bAnd(board, board * Math.pow(2, -7)); // horizontal check
	var diag2 = bAnd(board, board * Math.pow(2, -7)); // diagonal check
	var vert = bAnd(board, board * Math.pow(2, -1)); // vertical check 
	return (bAnd(diag1, diag1 * Math.pow(2,-12)) != 0) || (bAnd(horz, horz * Math.pow(2,-14)) != 0) || (bAnd(diag2, diag2 * Math.pow(2,-16)) != 0) || (bAnd(vert, vert * Math.pow(2,-2)) != 0);
}
// bAnd - Bitwise And from http://stackoverflow.com/a/3638080
function bAnd(val1, val2) {
    var shift = 0, result = 0;
    var mask = ~((~0) << 30); 
    var divisor = 1 << 30; 
    while((val1 != 0) && (val2 != 0)) {
        var rs = (mask & val1) & (mask & val2);
        val1 = Math.floor(val1 / divisor); 
        val2 = Math.floor(val2 / divisor); 
        for(var i = shift++; i--;) { 
            rs *= divisor;
        }
        result += rs;
    }
    return result;
}
  
// testWin - Test if player ("yellow"/"red") has won 
function checkWin(player) {
	var code = (player == "yellow" ? 1 : 2);
	var board = boardToDecimal(generateBoard(code, true), true);
	var win = hasWon(board);
	console.log(code + " " + board + " " + win);
	if (win) {
		clearTimeout(aiMove);
	}
	return win;
}

/*
board [0][1][2][3][4][5][6]
[5] -  5 12 19 26 33 40 47
[4] -  4 11 18 25 32 39 46 
[3] -  3 10 17 24 31 38 45
[2] -  2  9 16 23 30 37 44
[1] -  1  8 15 22 29 36 43
[0] -  0  7 14 21 28 35 42
*/