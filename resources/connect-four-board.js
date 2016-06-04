//Generates the html output for the connect 4 board (here in case it's messed up or needs to be changed)
function make() { 
	$("#board").html("");
	for (var i = 0; i < 7; i++) { // Add place buttons
		$("#board").append("<button class='place' id='place-"+i+"'></button>")
	}
	$("#board").append("<br>");
	for (var i = 5; i >= 0; i--) { // column x row
		for (var j = 0; j < 7; j++) {
			var id = j + "-" + i;
			$("#board").append("<div class='box'><div class='circle' id='circle-"+id+"'>"+id+"</div></div>");
		}
		$("#board").append("<br>\r\n");
	}
}