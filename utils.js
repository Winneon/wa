var http    = require("http"),
    https   = require("https"),
    request = require("request");

var config  = require("./config.json");

function Utils(app){
	this.app = app;
	
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
		var id = "";
		if (link.indexOf("youtu.be") > -1){
			id = link.split("youtu.be/")[1];
		} else {
			id = link.split("v=")[1];
			var pos = id.indexOf("&");
			if (pos > -1){
				id = id.substring(0, pos);
			}
		}
		return id;
	};
	
	this.get_youtube_data = function(link, callback){
		request({
			url: "https://www.googleapis.com/youtube/v3/videos?id=" + this.get_id(link) + "&key=" + config.yt_key + "&part=snippet,contentDetails",
			json: true
		}, function(error, response, data){
			if (!error && response.statusCode == 200 && data.items.length > 0){
				try {
					var title = data.items[0].snippet.title;
					var link = "https://www.youtube.com/watch?v=" + data.items[0].id;
					var duration = data.items[0].contentDetails.duration.replace("PT", "");
					var thumb = data.items[0].snippet.thumbnails.high.url;
					
					duration = duration.replace("H", " * 3600) + (");
					duration = duration.replace("M", " * 60) + (");

					if (duration.indexOf("S") > -1){
						duration = duration.replace("S", " * 1)");
					} else {
						duration = duration + "0)";
					}
					
					var secs = eval("(" + duration);
					
					callback(true, title, link, secs, thumb);
				} catch (error){
					console.log("There was an error parsing a request:");
					console.log(error);
					callback(false);
				}
			} else {
				console.log(data);
				callback(false);
			}
		});
	};
	
	this.get_soundcloud_data = function(link, callback){
		request({
			url: "https://api.soundcloud.com/resolve.json?url=" + link + "&client_id=" + config.sc_key,
			json: true
		}, function(error, response, data){
			if (!error && response.statusCode == 200 && data.kind == "track"){
				try {
					var title = data.title;
					var link = data.permalink_url;
					var secs = Math.round(data.duration / 1000);
					var thumb = data.artwork_url;

					callback(true, title, link, secs, thumb);
				} catch (error){
					console.log("There was an error parsing a request:");
					console.log(error);
					callback(false);
				}
			} else {
				callback(false);
			}
		});
	}
	
	this.set_headers = function(res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,POST");
		res.header("Access-Control-Allow-Header", "Content-Type");
	};
	
	this.render_page = function(data){
		data.res.render(data.page.indexOf("/") == 0 ?
			data.page.substring(1, data.page.length) :
			data.page, function(error, html){
			if (error){
				console.log(error);
				data.res.redirect("/error");
			} else {
				data.res.end(html);
			}
		});
	};
	
	this.add_login_cookie = function(res, username){
		res.cookie("user", username, {
			path: "/",
			maxAge: 60 * 60 * 24 * 365 * 20 * 1000 // Lasts 20 years! That's not pushing it, right?
		});
	};
	
	return this;
}

module.exports = Utils;