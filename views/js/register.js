$(document).ready(function(){
	$("button").click(function(event){
		submit();
	});
	$("input").keydown(function(event){
		if (event.which == 9){
			if ($(this).attr("name") == "code"){
				$("input[name='password']").focus();
			} else {
				$("input[name='code']").focus();
			}
			return false;
		}
		if (event.which == 13){
			submit();
			return false;
		}
	});
});

function submit(){
	var code = $("input[name='code']").val();
	var pass = $("input[name='password']").val();
	if (code != "" && pass != ""){
		$.post("/api/register", {
			code: code,
			password: pass
		}, function(data){
			if (data.success){
				window.location.assign(window.location.search == "" ? window.location.origin : toJSON(window.location.search.replace("?", "")).redirect);
			}
		});
	}
}