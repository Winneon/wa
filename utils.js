var http    = require("http"),
    https   = require("https"),
    request = require("request");

var config  = require("./config.json");

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
	
	this.get_youtube_data = function(link, callback){
		request({
			url: "https://www.googleapis.com/youtube/v3/videos?id=" + this.get_id(link) + "&key=" + config.key + "&part=snippet,contentDetails",
			json: true
		}, function(error, response, data){
			if (!error && response.statusCode == 200 && data.items.length > 0){
				var title = data.items[0].snippet.title;
				var link = "https://www.youtube.com/watch?v=" + data.items[0].id;
				var duration = data.items[0].contentDetails.duration.replace("PT", "");
				
				duration = duration.replace("H", " * 3600) + (");
				duration = duration.replace("M", " * 60) + (");
				duration = duration.replace("S", " * 1)");
				
				var secs = eval("(" + duration);
				
				callback(true, title, link, secs);
			} else {
				callback(false);
			}
		});
	};
}

module.exports = new Utils();