var color = "yellow";
var aiMove;
var winDialog = $("#win-dialog").dialog({
	modal: true,
	autoOpen: false,
	height: 215,
	width: 380,	
	buttons: {
		"New Game": function() {
			$("#reset").trigger("click");
			$(this).dialog("close");
		},
		Close: function() {
			$(this).dialog("close");
		}
	}		
});

// setupBoard - Set up or reset the game board and placement buttons
function resetBoard() {
	$("#swap").button("enable");
	$("#yellow, #red").button("enable");
	$(".place").button("enable");
	$(".circle").removeClass("red yellow h-yellow h-red hover last disabled");
}

function setupBoard() {
	$(".place").button({icons: { primary: "ui-icon-carat-1-s" }, text: false})
	$(".place").on("click", function() {
		var column = $(this).attr("id").split('-')[1];
		placePiece(column);
	});
	$('#board').on({
		mouseenter: function() {
			if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red, .disabled')) {
				$(this).addClass("h-"+color + " hover");
			}
		},
		mouseleave: function() {
			if ($(this).hasClass("hover") && !$(this).hasClass("disabled")) {
				$(this).removeClass("h-"+color + " hover");
			}
		},
		click: function() { 
			if ($('.next').attr('value') != "ai" && $(this).hasClass('hover') && !$(this).is('.yellow, .red, .disabled')) {
				var id = $(this).attr('id').substring(7);
				placePiece(id);
				$(this).removeClass("h-yellow h-red");
				if ($('.next').attr('value') != "ai" && !$(this).is('.yellow, .red')) {
					$(this).addClass("h-"+color+" hover");
				}
			}
		}
	}, ".circle");
}

// setupTriggers - Set up various button and div, hover/click triggers
function setupTriggers() {
	$('#reset').button({icons:{ primary: " ui-icon-refresh" }}).click(function() {
		clearTimeout(aiMove);
		resetBoard();
		// Reset to two humans with yellow going first
		$("#yellow, #red").attr("value", "human");
		$("#yellow span, #red span").html("Human");
		$("#red").removeClass("next");
		$("#yellow").addClass("next");
		color = "yellow";
	});
	$('#yellow, #red').button().click(function() {
		var against = $(this).attr("value") === "human" ? "AI" : "Human";
		$(this).attr("value", against.toLowerCase());
		$("span", this).html(against);
		if (checkDisable()) {
			aiMove = setTimeout(function() { playPickAI(); }, 2500);
		}
	});
	$("#swap").button({icons: { primary: "ui-icon-transfer-e-w" }}).click(function() {
		swapNext();
	});
}

// swapNext - Swap to the next player, disable or play AI if needed
function swapNext() {
	if (checkWin(color)) {
		$("#swap, #yellow, #red, .place").button('disable');
		$(".circle:not(.yellow, .red)").addClass("disabled");
	} else {
		$('#yellow, #red').toggleClass("next");
		color = $('.next').attr("id");
		if (checkDisable()) {
			aiMove = setTimeout(function() { playPickAI(); }, 2500);
		}
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
			console.log(placeColor.charAt(0).toUpperCase() + ": " + id)
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

// checkFull() - Check if current board state is full
// checkFull(col) - Check if column is full
function checkFull(col = -1) {
	var id = ((col == -1) ? ".circle:not(.yellow, .red)" : "div[id^='circle-"+col+"-']:not(.yellow, .red)");
	var full = $(id).length == 0;
	if (col == -1 && full) {
		clearTimeout(aiMove);
		$("#win-dialog").dialog("option", "title", "Draw");
		$('p#win-text').html("<span class='ui-icon ui-icon-star' style='display:inline-block'></span> There has been a draw!");
		var winPop = setTimeout(function() { winDialog.dialog("open") }, 500);	
	}
	return full;
}

// playAI - First AI
function playAI() {
	//if ($('.next').attr('value') === "ai") {
		var code = $('.next').attr('id') == "yellow" ? 1 : -1; // Get AI's color number
		var placed = false;
		if (!$("#circle-3-0").is(".yellow, .red")) { // Start center if first
			placePiece(3);
			placed = true;
		} else {
			var winner = -1;
			var blocker = -1;
			for (var i = 0; i < 7; i++) { // Try to find winner / blocker
				if (!checkFull(i)) {
					var board = generateBoard();
					var aiBoard = generateBoard(code);
					var enemyBoard = generateBoard(-code);
					var rowPlayed = getRowIfPlaced(i, board);
					board[i][rowPlayed] = code;
					aiBoard[i][rowPlayed] = 1;
					enemyBoard[i][rowPlayed] = 1;
					if (hasWon(aiBoard)) {
						winner = i;
					} else if (blocker < 0 && hasWon(enemyBoard)) { 
						blocker = i;
					}
				}
			}
			if (winner > -1) {
				placePiece(winner);
				placed = true;
			} else if (blocker != -1) {
				placePiece(blocker);
				placed = true;
			} else {
				while (!placed && !checkFull()) {
					var slots = Array(); // Make array of unfilled columns
					var badSlots = Array(); // Keep track of "bad slots"
					for (var s = 0; s < 7; s++) {
						if (!checkFull(s)) {
							slots.push(s);
							var board = generateBoard();
							var tRow = getRowIfPlaced(s, board);
							if (tRow < 5) { // Check if bad slots if there is room left in column
								var enemyBoard = generateBoard(-code);
								enemyBoard[s][tRow + 1] = 1;
								if (hasWon(enemyBoard)) { // Check if placing there would let the enemy win -> "bad slot"
									badSlots.push(s);
								}
							}
						}
					}
					if (slots.length != badSlots.length) { // Exclude bad slots if possible
						slots = slots.filter( function( el ) {
							return badSlots.indexOf( el ) < 0;
						});
					}
					var col = slots[Math.floor((Math.random() * slots.length))];
					if (badSlots.indexOf(3) == -1 && !$("#circle-3-5").is(".yellow, .red")) col = 3; // Play center as opposed to others if not a danger spot
					placed = placePiece(col);
				}
			}
		}
	//}
}

// playAI2 - Second playAI - Ranks board states after placing in each column
function playAI2() {
	if ($('.next').attr('value') === "ai") {
		var code = $('.next').attr('id') == "yellow" ? 1 : -1;
		var slots = getBestSlots(generateBoard(), code);
		var col = slots[Math.floor((Math.random() * slots.length))];
		placePiece(col);
	}
}
function getBestSlots(board, code) { 
	var t = evalBoard(board, code);
	console.log('%c[' + t + ']', "color: orange");
	var max = 0;
	var slots = new Array();
	var loc = -1; 
	for (var i = 0; i < 7; i++) { 
		if (!checkFullBoard(board, i) && Math.abs(t[i]) > Math.abs(max)) { 
			max = t[i]; 
			loc = i; 
		}  
	} 
	for (var i = 0; i < 7; i++) {
		if (!checkFullBoard(board, i) && Math.abs(t[i]) == Math.abs(max))
			slots.push(i);
	}
	return slots;
}
function evalBoard(bitboard, code) { 
	var scores = new Array(7).fill(25);
	if (!checkFullBoard(bitboard)) {
		if (!checkFullBoard(bitboard, 3)) {
			scores[3] = 100;
		}
		var col = 0;
		while (col < 7) {
			if (!checkFullBoard(bitboard, col)) {
				var aiBoard = generatePlayerBoard(code, bitboard);
				var enemyBoard = generatePlayerBoard(-code, bitboard);
				var rowPlayed = getRowIfPlaced(col, bitboard);
				aiBoard[col][rowPlayed] = 1;
				enemyBoard[col][rowPlayed] = 1;
				if (hasWon(aiBoard)) {
					scores[col] = 1000; // win
				} else if (hasWon(enemyBoard)) { 
					scores[col] = -1000; // win for opponent 
				} else if (rowPlayed < 5) {
					enemyBoard[col][rowPlayed] = 0;
					enemyBoard[col][rowPlayed + 1] = 1;
					if (hasWon(enemyBoard)) { // win for opponent in next turn
						scores[col] = -10;
					}
				}
			} else {
				scores[col] = 0;
			}
			col++;
		}
	}
	return scores;
}

// playAI3 - Third AI
function playAI3() {
	if ($('.next').attr('value') === "ai") {
		if ($('.circle.yellow, .circle.red').length < 3) {
			placePiece(3);
		} else {
			var board = generateBoard();
			var code = $('.next').attr('id') == "yellow" ? 1 : -1;
			var slots = minimax(board, code, 6, true);
			var col = slots[0];
			placePiece(col);
		}
	}
}
function minimax(board=generateBoard(), code=-1, depth=6, maxing=true, alpha, beta) {
	var initial = [-1, evalBoard2(board, code)];
	if (depth == 0 || initial[1] == 100000 || initial[1] == -100000) return initial;
	var best = (maxing) ? [-1, -100000] : [-1, 100000];
	var columns = shuffle([0,1,2,3,4,5,6]);
	//var columns = [0,1,2,3,4,5,6];
	for (var i = 0; i < 7; i++) {
		var col = columns[i];
		if (!checkFullBoard(board, col)) {
			var newBoard = JSON.parse(JSON.stringify(board));
			var rowPlayed = getRowIfPlaced(col, newBoard);
			newBoard[col][rowPlayed] = (maxing) ? code : -code;
			var v = minimax(newBoard, code, depth-1, !maxing, alpha, beta);
			if (best[0] == -1 || (maxing && v[1] > best[1]) || (!maxing && v[1] < best[1])) {
				best = [col, v[1] / 2];
				if (maxing) alpha = v[1] / 2;
				else beta = v[1] / 2; 
			}
			if (depth == 6) 
				console.log('%c[' + col + " " + v[1] + "] [" + best[0] + " " + best[1] + "]", "color: red");
			if (alpha >= beta) {
				return best;
			}
		}
	}
	return best;
}
function evalBoard2(board=generateBoard(), code=-1) {
	var aiBoard = generatePlayerBoard(code, board);
	var enemyBoard = generatePlayerBoard(-code, board);
	var score = 0;
	if (hasWon(aiBoard)) {
		score = 100000;
	} else if (hasWon(enemyBoard)) { 
		score = -100000; 
	} else {
		//var t = evalBoard(board, -code);
		//if (t.indexOf(1000) != -1) score = -10000; // If this board lets the other player win next
		//else if (t.indexOf(-1000) != -1) score = 2000; // If next play blocks this player's win
	}
	return score;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {	
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function playPickAI() {
	if (color == "yellow") playAI2();
	else playAI3();
}
// generatePlayerBoard - Given a full bitboard, generate a single player's board
function generatePlayerBoard(player, board) { 
	var newBoard = new Array(7);
	for (var i = 0; i < 7; i++) {
		newBoard[i] = new Array(6);
		for (var j = 0; j < 6; j++) {
			if (board[i][j] == player) {
				newBoard[i][j] = 1;
			} else {
				newBoard[i][j] = 0; 
			}
		}
	}
	return newBoard;
}

// checkFullBoard() - Checks if current board state is full
// checkFullBoard(board) - Checks if given board is full
// checkFullBoard(board, column) - Checks if column of board is full
function checkFullBoard(board = generateBoard(), col = -1) {
	if (col == -1) {
		for (var i = 0; i < 7; i++) {
			for (var j = 0; j < 6; j++) {
				if (board[i][j] == 0) {
					return false;
				}
			}
		}
	} else {
		for (var j = 0; j < 6; j++) {
			if (board[col][j] == 0) {
				return false;
			}
		}
	}
	return true;
}

// getRowIfPlaced - If a piece is played in given column, return its row (column-row) or -1 if full
function getRowIfPlaced(column, board) {
	var found = false;
	var row = 0;
	while (!found && row < 6) {
		if (board[column][row] == 0) found = true;
		else row++;
	}
	if (row > 5) row = -1;
	return row;
	
}

// generateBoard(code, addRow) - generate a bitboard for player code
// code: 0 = both, 1 = yellow, -1 = red
// Board will return array of 0/1/2 OR 0/1 for yellow/red boards
// addRow adds an additional row for purposes of converting to long / solution checking
function generateBoard(code = 0) {
	var board = new Array(7);
	for (var i = 0; i < 7; i++) {
		board[i] = new Array(6).fill(0);
	}
	var colors = "div.";
	if (code == 0) colors += "yellow, div.red";
	else if (code == 1) colors += "yellow";
	else if (code == -1) colors += "red";
	$(colors).each(function() {
		var bit = ($(this).hasClass("yellow") || code != 0 ? 1 : -1); 
		var id = $(this).attr('id').split('-');
		var column = id[1];
		var row = id[2];
		board[column][row] = bit;
	});
	return board;
}

// Convert bitboard array to its decimal representation
function boardToDecimal(bitboard) {
	var decimal = 0;
	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 6; j++) {
			if (bitboard[i][j] == 1) {
				decimal += Math.pow(2, 7*i + j);
			}
		}
	}
	return decimal;
}

// hasWon - Given a player's board, check if they are the winner - Adapted from John Tromp's method - https://tromp.github.io/c4/c4.html
function hasWon(bitboard) {
	var board = boardToDecimal(bitboard);
	var diag1 = bAnd(board, board * Math.pow(2, -6)); // diagonal check
	var horz = bAnd(board, board * Math.pow(2, -7)); // horizontal check
	var diag2 = bAnd(board, board * Math.pow(2, -8)); // diagonal check
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
function checkWin(player, real=true) {
	var code = (player == "yellow" ? 1 : -1);
	var board = generateBoard(code);
	var win = hasWon(board);
	if (win && real) {
		clearTimeout(aiMove);
		$("#win-dialog").attr("title", "Winner");
		var playerr =  "<span class='"+player+"'>" + $("#"+player + " span").html() + "</span>";
		$('p#win-text').html("<span class='ui-icon ui-icon-star' style='display:inline-block'></span> "+playerr+" has won the game!");
		var winPop = setTimeout(function() { winDialog.dialog("open") }, 500);
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