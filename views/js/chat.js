$(document).ready(function(){
	$("input").keypress(function(event){
		if (event.which == 13){
			$.post("/api/chat", {
				type: "chat",
				message: $("input[name='input']").val()
			}, function(data){
				refresh(data.message);
			});
			$("input[name='input']").val("");
			return false;
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
	var changed = false;
	for (var i in data){
		if ($("#" + i).length <= 0){
			$("div.chat_flow").append("<span id='" + i + "'></span>");
		}
		if ($("span#" + i).html() != data[i]){
			changed = true;
		}
		$("span#" + i).html(data[i]);
	}
	if (changed){
		$("div.chat_flow").scrollTop(50000);
	}
}

function players(data){
	$("div.heads").html("");
	for (var i in data){
		if ($("#" + data[i]).length <= 0){
			$("div.heads").append($("<span/>", {
				"title": data[i],
				"id": data[i]
			}));
		}
		$("span#" + data[i]).append($("<img/>", {
			"src": "https://minotar.net/avatar/" + data[i] + "/45.png",
		}));
	}
}