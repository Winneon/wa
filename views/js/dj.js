$(document).ready(function(){
	$("div.controls i.fa-plus").click(function(event){
		$("input[name='add']").toggleClass("visible");
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
							// Add refresh queue to list.
						}
					});
				}
			};
		}
	}
});