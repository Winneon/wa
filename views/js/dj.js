$(function(){
	$('#platform').bind("contextmenu", function(e){
		e.preventDefault(); 
	});
	$('#platformAdd').mousedown(function(e){
		if (isLeftClick(e)){
			alert("Add");
		}
	});
	$('#platformVeto').mousedown(function(e){
		if (event.which == 1){
			alert("Veto");
		}
	});
	$('#platformLogin').mousedown(function(e){
		if (event.which == 1){
			alert("Veto");
		}
	});
	$('#platformSettings').mousedown(function(e){
		if (event.which == 1){
			alert("Veto");
		}
	});
	
	$('#platformAdd').mouseenter(function(){
		$('#platformImage').src="../img/platformAdd.png";
	});
	$('#platformVeto').mouseenter(function(){
		$('#platformImage').src="../img/platformVeto.png";
	});
	$('#platformLogin').mouseenter(function(){
		$('#platformImage').src="../img/platformLogin.png";
	});
	$('#platformSettings').mouseenter(function(){
		$('#platformImage').src="../img/platformSettings.png";
	});
});

function isLeftClick(e){
	return e.which == 1;
}

$($("h1 span")[0]).html(" - Test Song");