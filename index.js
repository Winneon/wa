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
		res.json(data);
	});
	utils.cmd("google-chrome", [req.body.link]);
	res.json({
		message: "Currently testing. Do not send anymore requests! Thanks <3."
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