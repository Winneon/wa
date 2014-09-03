var express = require("express"),
    session = require("express-session"),
    app     = express(),
    http    = require("http").Server(app),
    parser  = require("body-parser"),
    path    = require("path");

var utils   = require("./utils.js"),
    users   = require("./users.js"),
    queue   = require("./queue.js"),
    config  = require("./config.json");

app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(parser.urlencoded({
	extended: true
}));

app.use(express.static(app.get("views")));
app.use(parser.json());
app.use(session({
	secret: config.secret,
	resave: true,
	saveUninitialized: true
}));

var router = express.Router();

app.get("*", function(req, res){
	res.render(req.url.replace("/", ""), {
		basedir: app.get("views"),
		url: req.url,
		session: req.session
	});
});

router.post("/register", function(req, res){
	if (users.register(req.body.username, req.body.password)){
		req.session.user = req.body.username;
		res.json({
			success: true
		});
	} else {
		res.json({
			success: false
		});
	}
});

router.post("/login", function(req, res){
	if (users.login(req.body.username, req.body.password)){
		req.session.user = req.body.username;
		res.json({
			success: true
		});
	} else {
		res.json({
			success: false
		});
	}
});

// dJRequest POST Data

router.post("/utils/dj", function(req, res){
	if (req.body.type){
		switch (req.body.type){
			default:
				res.json({
					type: "error",
					data: {
						message: "Unknown request type!"
					}
				});
				break;
			case "add":
				if (queue.get_request(req.body.user)){
					res.json({
						type: "error",
						data: {
							message: "You have already requested a song!"
						}
					});
				} else {
					utils.get_youtube_data(req.body.data.link, function(success, title, link, duration){
						if (success){
							queue.add_request(title, link, duration, req.body.user);
							res.json({
								type: "refresh",
								data: {
									queue: queue.list
								}
							});
						} else {
							res.json({
								type: "error",
								data: {
									message: "There was an error parsing your link!"
								}
							});
						}
					});
				}
				break;
			case "remove":
				if (queue.rem_request(req.body.user)){
					res.json({
						type: "refresh",
						data: {
							queue: queue.list
						}
					});
				} else {
					res.json({
						type: "error",
						data: {
							message: "You have yet to request a song to drop!"
						}
					});
				}
				break;
			case "veto":
				if (queue.playing){
					queue.kill();
					res.json({
						type: "refresh",
						data: {
							queue: queue.list
						}
					});
				} else {
					res.json({
						type: "error",
						data: {
							message: "There is nothing playing at the moment!"
						}
					});
				}
				break;
			case "refresh":
				res.json({
					type: "refresh",
					data: {
						queue: queue.list
					}
				});
				break;
		}
	} else {
		res.json({
			type: "error",
			data: {
				message: "You did not specify a request type!"
			}
		});
	}
});

setInterval(function(){
	if (!queue.playing){
		if (queue.list.length > 0){
			queue.playing = true;
			queue.process = utils.cmd("google-chrome", [queue.list[0].link]);
			queue.timeout = setTimeout(function(){
				queue.kill();
			}, (queue.list[0].duration + 10) * 1000);
		}
	} else if (queue.list.length == 0){
		queue.playing = false;
	}
}, 500);

app.use(router);

http.listen(config.port, function(){
	console.log("Listening on port " + config.port + ".");
});

process.stdin.resume();

process.on("SIGINT", function(){
	console.log("Terminating wa. Saving users to file...");
	users.save();
	process.exit();
});

console.log_copy = console.log.bind(console);

console.log = function(data){
	this.log_copy("[" + utils.timestamp() + "]:", data);
};