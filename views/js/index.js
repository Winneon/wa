var user = $("div.user_box span").text().toLowerCase() == "login or register" ? "" : $("div.user_box span").text();
$(document).ready(function(){
	$(document).click(function(event){
		var target = event.target;
		if (target.nextSibling && $(target).parent().parent().hasClass("navbar")){
			$("ul.drop").removeClass("drop_visible");
			$(target.nextSibling).addClass("drop_visible");
		} else {
			$("ul.drop").removeClass("drop_visible");
		}
	});
});

function toJSON(data){
	return JSON.parse("{\"" + decodeURI(data.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + "\"}");
}

function print_message(data){
	var div = $("<div/>", {
		"class": "message"
	});
	div.addClass(data.error ? "red" : "green");
	div.text(data.message);
	if ($("div.message").length > 0){
		$("div.message").replaceWith(div);
	} else {
		$("div.box").prepend(div);
	}
	setTimeout(function(){
		div.remove();
	}, 7500);
}