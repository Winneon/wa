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
		
		child.stdout.on("data", function(buffer){
			self.stdout += buffer.toString();
		});
		child.stdout.on("error", function(error){
			console.log(error);
		});
		child.stdout.on("end", function(){
			end(self);
		});
	};
}

module.exports = new Utils();