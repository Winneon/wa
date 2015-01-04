var express = require("express"),
    session = require("express-session"),
    cookie  = require("cookie-parser"),
    app     = express(),
    http    = require("http").Server(app),
    parser  = require("body-parser"),
    path    = require("path");

var utils   = require("./utils.js")(app),
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
app.use(cookie());

var router = express.Router();

router.use(function(req, res, next){
	utils.set_headers(res);
	next();
});

router.get("/api/logout", function(req, res){
	var cont = req.cookies.user ? true : false;
	if (cont){
		res.clearCookie("user");
	}
	res.format({
		"application/json": function(){
			res.json({
				success: cont
			});
		},
		"text/html": function(){
			res.redirect("/index");
		}
	});
});

router.post("/api/register", function(req, res){
	if (users.register(req.body.username, req.body.password)){
		utils.add_login_cookie(res, req.body.username);
		res.json({
			success: true
		});
	} else {
		res.json({
			success: false
		});
	}
});

router.post("/api/login", function(req, res){
	if (users.login(req.body.username, req.body.password)){
		utils.add_login_cookie(res, req.body.username);
		res.json({
			success: true
		});
	} else {
		res.json({
			success: false
		});
	}
});

router.post("/api/chat", function(req, res){
	var time = utils.timestamp();	 
	if (req.body.type == "minecraft_refresh"){
		if (users.saved_chat.length > 0){
			users.players = req.body.players;
			res.json({
				message: users.saved_chat,
				type: "send"
			});
		} else {
			res.json({
				message: ["WC: Website Chat Hooked!"],
				type: "send"
			});
		}
	} else if (req.body.type == "minecraft_insert"){
		users.add_chat("[" + time.substring(0, time.indexOf(" ")) + "] " + req.body.user + ": " + req.body.message);
		res.json({
			message: "[" + time.substring(0, time.indexOf(" ")) + "] " + req.body.user + ": " + req.body.message,
			type: "update"
		});
	} else {
		if (req.body.type == "chat" && req.body.message != ""){
			users.add_chat("[" + time.substring(0, time.indexOf(" ")) + "] " + req.cookies.user + ": " + req.body.message);
		}
		res.json({
			message: users.saved_chat,
			players: users.players
		});
	}
});

// dJRequest POST Data

router.post("/api/dj", function(req, res){
	if (req.body.type){
		if (req.cookies.user == undefined && req.body.data == undefined){
			res.json({
				type: "message",
				data: {
					error: true,
					message: "You are not logged in! Please log in by sending a JSON request to /api/login."
				}
			});
			return;
		} else if (req.body.data && req.body.data.username && req.body.data.password){
			if (users.login(req.body.data.username, req.body.data.password)){
				req.cookies.user = req.body.data.username;
			}
		}
		switch (req.body.type){
			default:
				res.json({
					type: "message",
					data: {
						error: true,
						message: "Unknown request type!"
					}
				});
				break;
			case "add":
				if (queue.get_request(req.cookies.user)){
					res.json({
						type: "message",
						data: {
							error: true,
							message: "You have already requested a song!"
						}
					});
				} else {
					utils.get_youtube_data(req.body.data.link, function(success, title, link, duration){
						if (success){
							queue.add_request(title, link, duration + 5, req.cookies.user);
							console.log("Added a new request from " + req.cookies.user + ".");
							res.json({
								type: "refresh",
								data: {
									message: "Added " + link + " to the queue.",
									queue: queue.list
								}
							});
						} else {
							res.json({
								type: "message",
								data: {
									error: true,
									message: "There was an error parsing your link!"
								}
							});
						}
					});
				}
				break;
			case "remove":
				var cont = false;
				if (queue.get_request(req.cookies.user)){
					queue.list[0] == queue.get_request(req.cookies.user) ? queue.kill() : queue.rem_request(req.cookies.user);
					cont = true;
				}
				if (cont){
					console.log("Removed " + req.cookies.user + "'s request.");
					res.json({
						type: "refresh",
						data: {
							message: "Removed your request from the queue.",
							queue: queue.list
						}
					});
				} else {
					res.json({
						type: "message",
						data: {
							error: true,
							message: "You have yet to request a song to drop!"
						}
					});
				}
				break;
			case "veto":
				if (queue.playing && users.get_user(req.cookies.user).staff){
					console.log("Vetoed the current request.");
					queue.kill();
					res.json({
						type: "refresh",
						data: {
							message: "Vetoed the current request.",
							queue: queue.list
						}
					});
				} else if (!users.get_user(req.cookies.user).staff){
					res.json({
						type: "message",
						data: {
							error: true,
							message: "You are not staff!"
						}
					});
				} else {
					res.json({
						type: "message",
						data: {
							error: true,
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
			type: "message",
			data: {
				error: true,
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

app.use(function(req, res, next){
	res.locals.basedir = app.get("views");
	res.locals.url = req.url.split("?")[0];
	res.locals.user = req.cookies.user;
	
	next();
});

app.get("*", function(req, res){
	utils.render_page({
		res: res,
		page: req.url.split("?")[0],
	});
});

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