$(document).ready(function(){
	$("div.controls i.fa-plus").click(function(event){
		$("input[name='add']").toggleClass("visible");
	});
	$("div.controls i.fa-minus").click(function(event){
		if (user == ""){
			print_message({
				error: true,
				message: "You are not logged in!"
			});
		} else {
			$.post("/api/dj", {
				type: "remove"
			}, function(data){
				if (data.type == "message" || data.data.message){
					print_message(data.data);
					if (data.type == "message"){
						return;
					}
				}
				refresh(data.data.queue);
			});
		}
	});
	$("div.controls i.fa-refresh").click(function(event){
		$.post("/api/dj", {
			type: "refresh"
		}, function(data){
			refresh(data.data.queue);
		});
	});
	$("div.controls i.fa-gavel").click(function(event){
		$.post("/api/dj", {
			type: "veto"
		}, function(data){
			if (data.type == "message" || data.data.message){
				print_message(data.data);
				if (data.type == "message"){
					return;
				}
			}
			refresh(data.data.queue);
		});
	});
	var add_input = document.getElementsByTagName("input");
	for (var i = 0 ; i < add_input.length; i++){
		if (add_input[i].name == "add"){
			$(add_input[i]).keydown(function(event){
				if (event.which == 13){
					var text = $(this).val();
					add_request(this, text);
					return false;
				}
			});
			add_input[i].onpaste = function(event){
				var clip = event.clipboardData.getData("text/plain");
				add_request(this, clip);
			};
		}
	}
	setInterval(function(){
		$.post("/api/dj", {
			type: "refresh"
		}, function(data){
			refresh(data.data.queue);
		});
	}, 5000);
});

function add_request(input, link){
	if (user == ""){
		print_message({
			error: true,
			message: "You are not logged in!"
		});
	} else if (link.indexOf("youtube.com/watch?") == -1){
		print_message({
			error: true,
			message: "You have entered an invalid YouTube link!"
		});
	} else {
		$(input).prop("disabled", true);
		$(input).val("");
		$.post("/api/dj", {
			type: "add",
			data: {
				link: link
			}
		}, function(data){
			if (data.type == "message" || data.data.message){
				print_message(data.data);
				if (data.type == "message"){
					return;
				}
			}
			refresh(data.data.queue);
		});
	}
}

function refresh(queue){
	var disabled = false;
	var children = $("table tbody").children();
	if (queue[0]){
		$($("h1 span")[0]).html(queue[0].title);
	} else {
		$($("h1 span")[0]).html("Nothing Playing");
	}
	for (var i = 0; i < 10; i++){
		var row      = $(children[i + 1]).children(),
		    name     = $(row[1]),
		    username = $(row[2]),
		    duration = $(row[3]);
		if (queue[i]){
			name.html($("<a/>", {
				"href": queue[i].link,
				"target": "_blank"
			}).html(queue[i].title));
			username.html(queue[i].user);
			var mins = Math.floor(queue[i].duration / 60);
			var secs = queue[i].duration % 60;
			if (secs < 10){
				secs = "0" + secs;
			}
			duration.html([mins, secs].join(":"));
			if (queue[i].user == user){
				disabled = true;
			}
		} else {
			if (name.html() != "-"){
				name.html("-");
			}
			if (username.html() != ""){
				username.html("-");
			}
			if (duration.html() != "--:--"){
				duration.html("--:--");
			}
		}
	}
	$("input[name='add']").prop("disabled", disabled);
}