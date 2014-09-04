$(document).ready(function(){
	$("button").click(function(event){
		switch ($(this).attr("name")){
			case "login":
				submit("login");
				break;
			case "register":
				submit("register");
				break;
		}
	});
	$("input").keydown(function(event){
		if (event.which == 9){
			if ($(this).attr("name") == "user"){
				$("input[name='password']").focus();
			} else {
				$("input[name='user']").focus();
			}
			return false;
		}
		if (event.which == 13){
			submit("login");
			return false;
		}
	});
});

function submit(type){
	var user = $("input[name='user']").val();
	var pass = $("input[name='password']").val();
	if (user != "" && pass != ""){
		$.post("/" + type, {
			username: user,
			password: pass
		}, function(data){
			if (data.success){
				window.location.assign(window.location.search == "" ? window.location.origin : toJSON(window.location.search.replace("?", "")).redirect);
			}
		});
	}
}