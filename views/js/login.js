$(document).ready(function(){
	$("button").click(function(event){
		switch ($(this).attr("name")){
			case "login":
				login();
				break;
			case "register":
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
			login();
			return false;
		}
	});
});

function login(){
	var user = $("input[name='user']").val();
	var pass = $("input[name='password']").val();
	if (user != "" && pass != ""){
		$.post("/login", {
			user: user,
			password: pass
		}, function(data){
			if (data.success){
				window.location.assign(window.location.origin);
			}
		});
	}
}