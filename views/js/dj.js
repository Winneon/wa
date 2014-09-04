$(document).ready(function(){
	$("div.controls i.fa-plus").click(function(event){
		$("input[name='add']").toggleClass("visible");
	});
	$("div.controls i.fa-minus").click(function(event){
		if (user == ""){
			// Warning code later.
		} else {
			$.post("/utils/dj", {
				type: "remove",
				user: user
			}, function(data){
				refresh(data.data.queue);
			});
		}
	});
	$("div.controls i.fa-refresh").click(function(event){
		$.post("/utils/dj", {
			type: "refresh"
		}, function(data){
			refresh(data.data.queue);
		});
	});
	$("div.controls i.fa-gavel").click(function(event){
		$.post("/utils/dj", {
			type: "veto"
		}, function(data){
			if (data.type == "error"){
				// Error handling!
			} else {
				refresh(data.data.queue);
			}
		});
	});
	var add_input = document.getElementsByTagName("input");
	for (var i = 0 ; i < add_input.length; i++){
		if (add_input[i].name == "add"){
			add_input[i].onpaste = function(event){
				var clip = event.clipboardData.getData("text/plain");
				if (user == ""){
					// Warning code here for later.
				} else if (clip.indexOf("youtube.com/watch?") == -1){
					// More warning code here for later.
				} else {
					$(this).prop("disabled", true);
					$(this).val("");
					$.post("/utils/dj", {
						type: "add",
						user: user,
						data: {
							link: clip
						}
					}, function(data){
						if (data.type == "error"){
							// Yet even more warning code.
						} else {
							refresh(data.data.queue);
						}
					});
				}
			};
		}
	}
	setInterval(function(){
		$.post("/utils/dj", {
			type: "refresh"
		}, function(data){
			refresh(data.data.queue);
		});
	}, 5000);
});

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