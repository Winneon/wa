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