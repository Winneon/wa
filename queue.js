var request = require("./request.js");

function Queue(){
	this.list = [];
	this.playing = false;
	
	this.get_request = function(user){
		for (var i = 0; i < this.list.length; i++){
			var request = this.list[i];
			if (request.user == user){
				return request;
			}
		}
		return undefined;
	};
	
	this.add_request = function(title, link, duration, user){
		if (this.get_request(user)){
			return false;
		}
		this.list.push(request(title, link, duration, user));
		return true;
	};
	
	this.rem_request = function(user){
		if (this.get_request(user)){
			this.list.splice(this.list.indexOf(this.get_request(user)), 1);
			return true;
		}
		return false;
	};
}

module.exports = new Queue();