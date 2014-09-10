$(document).ready(function(){
	$("input").keypress(function(event){
		if (event.which == 13){
			$.post("/api/chat", {
				type: "chat",
				message: $("input[name='input']").val()
			}, function(data){
				refresh(data.message);
			});
			$("input[name='input']").val('');
		}
	});

	setInterval(function(){
		$.post("/api/chat", {
			type: "refresh",
			message: ""
		}, function(data){
			refresh(data.message);
			players(data.players);
		});
	}, 2000);
});

function refresh(data){
	for (var i in data){
		if ($("#" + i).length <= 0){
			$("#chatFlow").append("<span id='" + i + "'></span>");
		}
		$("span[id='" + i + "']").html(data[i] + "<br />");
		$("span[id='" + i + "']").attr("visibility", "visible");
	}
	$("#chatFlow").scrollTop(9999);
}

function players(data){

	$("#chatWrapper").children('span').each(function(){
    	if (data.indexOf($(this).attr('id')) === -1){
    		$("#chatWrapper").remove("." + $(this).attr('id'));
    		console.log("attempted to remove")
    	}
	});
	
	for (var i in data){
		if ($("#" + data[i]).length <= 0){
			$("#chatWrapper").append("<span title='" + data[i] + "' style='float: right; overflow: scroll; padding-bottom: 2cm' id='" + data[i] + "'></span>");
		}
		$("span[id='" + data[i] + "']").html("&nbsp; <img height='30' width='30' src='https://minotar.net/avatar/" + data[i] + "/45.png' />&nbsp;");
	}
	
	if (data.length <= 0){
		$("#chatWrapper").empty('span');
		$("#chatWrapper").html("SERVER CHAT");
	}
}