$(document).ready(function(){
	$(document).click(function(event){
		var target = event.target;
		if (target.nextSibling){
			$("ul.drop").removeClass("drop_visible");
			$(target.nextSibling).addClass("drop_visible");
		} else {
			$("ul.drop").removeClass("drop_visible");
		}
	});
});