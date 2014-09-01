var http  = require("http"),
    https = require("https");

function Utils(){
	this.timestamp = function(){
		var date  = new Date().toString(),
		    split = date.split(" "),
		    time  = split[4] + " " + split[5];
		
		return time;
	};
	
	this.cmd = function(cmd, args, end){
		var spawn = require("child_process").spawn,
		    child = spawn(cmd, args),
		    self = this;
		
		child.on("error", function(error){
			console.log("An error has occurred! Code: " + error.code);
		});
		child.stdout.on("data", function(buffer){
			self.stdout += buffer.toString();
		});
		child.stdout.on("end", function(){
			if (end){
				end(self);
			}
		});
		
		return child;
	};
	
	this.get_id = function(link){
		var id = link.split("v=")[1];
		var pos = id.indexOf("&");
		if (pos > -1){
			id = id.substring(0, pos);
		}
		return id;
	};
}

module.exports = new Utils();