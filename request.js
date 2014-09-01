function Request(title, link, duration, user){
	this.title = title;
	this.link = link;
	this.duration = duration;
	this.user = user;
	return this;
}

module.exports = Request;