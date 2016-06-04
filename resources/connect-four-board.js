//Generates the html output for the connect 4 board (here in case it's messed up or needs to be changed)
function make() { 
	$("#board").html("");
	for (var i = 0; i < 7; i++) { // Add place buttons
		$("#board").append("<button class='place' id='place-"+i+"'></button>")
	}
	$("#board").append("<br>");
	var diag1 = 3;
	var diag2 = 15;
	for (var i = 5; i >= 0; i--) { // column x row
		for (var j = 0; j < 7; j++) {
			var id = j + "-" + i;
			var class2 = "";
			if (diag1 < 7 && diag1 > 0) class2 += " d-" + diag1;
			if (diag2 < 13 && diag2 > 6) class2 += " d-" + diag2;
			$("#board").append("<div class='box'><div class='circle "+class2+"' id='circle-"+id+"'>"+id+"</div></div>");
			diag1++;
			diag2--;
		}
		$("#board").append("<br>\r\n");
		diag1 -= 8
		diag2 += 6;
	}
}