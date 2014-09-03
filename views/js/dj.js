$(document).ready(function(){
	$("div.controls i.fa-plus").click(function(event){
		$("input[name='add']").toggleClass("visible");
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
				$(this).toggleClass("visible");
				console.log([user, clip].join(" "));
				if (user == ""){
					// Warning code here for later.
				} else if (clip.indexOf("youtube.com/watch?") == -1){
					// More warning code here for later.
				} else {
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
});

function refresh(data){
	var children = $("table tbody").children();
	for (var i = 0; i < 10; i++){
		var row      = $(children[i]).children(),
		    name     = $(row[1]),
		    username = $(row[2]),
		    duration = $(row[3]);
		if (queue[i]){
			name.html($("<a/>", {
				"href": queue[i].link
			}).html(queue[i].title));
			username.html(queue[i].user);
			duration.html(queue[i].duration);
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
}