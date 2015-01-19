var fs      = require("fs"),
    crypto  = require("crypto");

var config  = require("./config.json"),
    file    = require("./users.json");

var request = require("./request.js");

var chat = [];
var players = [];

function Users(){
	this.file = file;
	this.default_keys = {
		staff: false
	};
	
	this.players = players;
	this.saved_chat = chat;

	for (var i in this.file.data){
		this.file.data[i].playlist = [];
	}
	
	this.add_chat = function(message){
		chat.push(message);
		if (chat.length > 100){
			chat.splice(0, 1);
		}
	};

	this.add_request_playlist = function(title, link, duration, user, thumb){
		this.file.data[user].playlist.push(request(title, link, duration, user, thumb));
	};

	this.remove_request_playlist = function(user, link){
		for (var i in this.file.data[user].playlist){
			if (this.file.data[user].playlist[i].link == link){
				this.file.data[user].playlist.splice(i, 1);
				return true;
			}
		}
		return false;
	};
	
	this.register = function(username, password){
		password = this.encrypt(password);
		if (this.file.registered[username]){
			return false;
		}
		this.file.registered[username] = password;
		this.file.data[username] = this.default_keys;
		this.file.data[username].playlist = [];
		return true;
	};

	this.login = function(username, password){
		if (this.file.registered[username]){
			var decrypted = this.decrypt(this.file.registered[username]);
			if (decrypted == password){
				if (!this.file.data[username]){
					this.file.data[username] = this.default_keys;
				}
				for (var key in this.default_keys){
					if (!this.file.data[username][key]){
						this.file.data[username][key] = this.default_keys[key];
					}
				}
				return true;
			}
		}
		return false;
	};

	this.get_user = function(user){
		return this.file.data[user];
	};

	this.save = function(){
		for (var i in this.file.data){
			this.file.data[i].playlist = [];
		}
		fs.writeFileSync("users.json", JSON.stringify(this.file, null, "\t"));
	};

	this.encrypt = function(text){
		var cipher = crypto.createCipher("aes-256-cbc", config.encryption);
		var encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");
		
		return encrypted;
	};

	this.decrypt = function(text){
		var decipher = crypto.createDecipher("aes-256-cbc", config.encryption);
		var decrypted = decipher.update(text, "hex", "utf8");
		decrypted += decipher.final("utf8");
		
		return decrypted;
	};
}

module.exports = new Users();