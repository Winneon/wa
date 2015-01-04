$("input").keydown(function(event){
	if (event.which == 13){
		var title = $("input[name='title']").val();
		var link = $("input[name='link']").val();
		if (title != "" && link != ""){
			$("ul.list").append($("<a/>", {
				"href": link
			}).text(title));
		} else {
			print_message({
				error: true,
				message: "You did not fill in all of the fields!"
			});
		}
		return false;
	}
});