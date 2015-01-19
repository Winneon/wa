var express    = require("express"),
    session    = require("express-session"),
    cookie     = require("cookie-parser"),
    app        = express(),
    http       = require("http"),
    http_proxy = require("http-proxy"),
    proxy      = http_proxy.createProxyServer({ });
    parser     = require("body-parser"),
    path       = require("path"),
    fs         = require("fs");

var utils      = require("./utils.js")(app),
    users      = require("./users.js"),
    queue      = require("./queue.js"),
    config     = require("./config.json");

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
	if (req.cookies.user && users.get_user(req.cookies.user)){
		res.clearCookie("user");
		res.redirect("/login");
	} else {
		if (req.cookies.user){
			req.cookies.user = users.decrypt(req.cookies.user);
		}
		next();
	}
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
		utils.add_login_cookie(res, users.encrypt(req.body.username));
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
		utils.add_login_cookie(res, users.encrypt(req.body.username));
		res.json({
			success: true
		});
	} else {
		res.json({
			success: false
		});
	}
});

/*router.post("/api/chat", function(req, res){
	console.log(req.cookies.user);
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
});*/

// dJRequest POST Data

router.post("/api/dj", function(req, res){
	if (req.body.type){
		if (req.cookies.user == undefined && (req.body.data == undefined || (req.body.data.username == undefined && req.body.data.password == undefined))){
			res.json({
				type: "message",
				data: {
					error: true,
					message: "You are not logged in! Please log in by sending a JSON request to /api/login."
				}
			});
			return;
		} else if (req.body.data && req.body.data.username && req.body.data.password){
			if (req.body.data.username == "" || req.body.data.password == ""){
				res.json({
					type: "message",
					data: {
						error: true,
						message: "You are not logged in! Please log in by sending a JSON request to /api/login."
					}
				});
				return;
			}
			if (users.login(req.body.data.username, req.body.data.password)){
				req.cookies.user = req.body.data.username;
			} else {
				res.json({
					type: "message",
					data: {
						error: true,
						message: "You are not logged in! Please log in by sending a JSON request to /api/login."
					}
				});
				return;
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
				if (req.body.data.link.indexOf("youtu.be") > -1 || req.body.data.link.indexOf("youtube.com") > -1){
					utils.get_youtube_data(req.body.data.link, function(success, title, link, duration, thumb){
						data_callback(req, res, success, title, link, duration, thumb);
					});
				} else if (req.body.data.link.indexOf("soundcloud.com") > -1){
					utils.get_soundcloud_data(req.body.data.link, function(success, title, link, duration, thumb){
						data_callback(req, res, success, title, link, duration, thumb);
					});
				} else {
					res.json({
						type: "message",
						data: {
							error: true,
							message: "You have entered an invalid link!"
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
							queue: queue.list,
							playlist: users.get_user(req.cookies.user).playlist
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
			case "remove_playlist":
				if (users.remove_request_playlist(req.cookies.user, req.body.data.link)){
					console.log("Removed a request from " + req.cookies.user + "'s playlist.");
					res.json({
						type: "refresh",
						data: {
							message: "Removed your request from your playlist.",
							queue: queue.list,
							playlist: users.get_user(req.cookies.user).playlist
						}
					});
				} else {
					res.json({
						type: "message",
						data: {
							error: true,
							message: "Failed to remove your request from your playlist!"
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
							queue: queue.list,
							playlist: users.get_user(req.cookies.user).playlist
						}
					});
				} else if (!users.get_user(req.cookies.user).staff){
					res.json({
						type: "message",
						data: {
							error: true,
							message: "You are not staff, scrub!"
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
				//console.log(req.cookies.user);
				res.json({
					type: "refresh",
					data: {
						queue: queue.list,
						playlist: users.get_user(req.cookies.user).playlist
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
			}, (queue.list[0].duration + 15) * 1000);
		}
	} else if (queue.list.length == 0){
		queue.playing = false;
	}
}, 500);

function data_callback(req, res, success, title, link, duration, thumb){
	if (success){
		if (queue.get_request(req.cookies.user)){
			users.add_request_playlist(title, link, duration, req.cookies.user, thumb);
			res.json({
				type: "message",
				data: {
					error: true,
					message: "You have already requested a song!"
				}
			});
		} else {
			if (req.body.data.playlist && users.get_user(req.cookies.user).playlist[0].link == link){
				users.remove_request_playlist(req.cookies.user, link);
			}
			queue.add_request(title, link, duration, req.cookies.user, thumb);
			console.log("Added a new request from " + req.cookies.user + ".");
			res.json({
				type: "refresh",
				data: {
					message: "Added " + link + " to the queue.",
					queue: queue.list
				}
			});
		}
	} else {
		res.json({
			type: "message",
			data: {
				error: true,
				message: "There was an error parsing your link!"
			}
		});
	}
}

app.use(router);

app.use(function(req, res, next){
	res.locals.basedir = app.get("views");
	res.locals.url = req.url.split("?")[0];
	res.locals.user = req.cookies.user;
	
	next();
});

app.get("*", function(req, res){
	var page = req.url.split("?")[0];
	if (page == "/"){
		page = "/index";
	}
	if (fs.existsSync("views" + page + ".jade")){
		utils.render_page({
			res: res,
			page: page,
		});
	} else {
		res.redirect("/404");
	}
});

proxy.on("error", function(error, req, res){
	res.end();
});

// EXTREMELY IMPORTANT PROXY CODE. DO NOT MODIFY UNLESS GIVEN PERMISSION FROM YOUR OVERLORD, JESSE
http.createServer(function(req, res){
	if (req.headers.host){
		var hostname = req.headers.host.split(":")[0];

		if (hostname.indexOf("www.") == 0){
			hostname = hostname.replace("www.", "");
		}
		
		switch (hostname){
			case "shows.worldscolli.de":
			case "shows.ohsototes.com":
				proxy.web(req, res, {
					target: "http://localhost:8080"
				});
				break;
			case "forums.worldscolli.de":
			case "forums.ohsototes.com":
				proxy.web(req, res, {
					target: "http://localhost:9092"
				});
				break;
			case "worldscolli.de":
			case "ohsototes.com":
			case "worldsapart.no-ip.org":
				proxy.web(req, res, {
					target: "http://localhost:9091"
				});
				break;
		}
	} else {
		proxy.web(req, res, {
			target: "http://localhost:9091"
		});
	}
}).listen(9090, function(){
	console.log("Started the proxy on port 9090.");
	console.log("Started the main website on port " + config.port + ".");
});

app.listen(config.port);

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