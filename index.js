var express = require("express"),
    app     = express(),
    http    = require("http").Server(app),
    parser  = require("body-parser"),
    path    = require("path"),
    request = require("request");

var utils   = require("./utils.js"),
    queue   = require("./queue.js"),
    config  = require("./config.json");

app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(parser.urlencoded({
	extended: true
}));
app.use(parser.json());
app.use(express.static(app.get("views")));

var router = express.Router();

app.get("*", function(req, res){
	res.render(req.url.replace("/", ""), {
		basedir: app.get("views"),
		url: req.url
	});
});

// dJRequest POST Data

router.post("/utils/dj", function(req, res){
	request({
		url: "https://www.googleapis.com/youtube/v3/videos?id=" + utils.get_id(req.body.link) + "&key=AIzaSyDf0-iTSxH58brETEGzgsMypglGxDc2nJA&part=snippet,contentDetails",
		json: true
	}, function(error, response, data){
		var success = false;
		if (!error && response.statusCode == 200){
			var title = data.items[0].snippet.title;
			var link = "https://www.youtube.com/watch?v=" + data.items[0].id;
			var duration = data.items[0].contentDetails.duration.replace("PT", "");
			
			var hours = 1;
			var mins = 1;
			var secs = 0;
			
			if (duration.indexOf("H") > -1){
				hours = parseInt(duration.substring(0, duration.indexOf("H") - 1));
				duration = duration.replace(hours + "H", "");
			}
			console.log(duration + " " + hours);
			if (duration.indexOf("M") > -1){
				mins = parseInt(duration.substring(0, duration.indexOf("M") - 1));
				duration = duration.replace(mins + "M", "");
			}
			console.log(duration + " " + mins);
			
			secs = parseInt(duration.substring(0, duration.indexOf("S") - 1));
			
			console.log(duration + " " + secs);
			secs = secs * mins * hours;
			
			queue.add_request(title, link, secs, req.body.user);
			console.log(secs);
			var process = utils.cmd("google-chrome", [link]);
			success = true;
		}
		res.json({
			success: success
		});
	});
});

app.use(router);

http.listen(config.port, function(){
	console.log("Listening on port " + config.port + ".");
});

process.stdin.resume();

process.on("SIGINT", function(){
	console.log("Terminating wa.");
	process.exit();
});

console.log_copy = console.log.bind(console);

console.log = function(data){
	this.log_copy("[" + utils.timestamp() + "]:", data);
};