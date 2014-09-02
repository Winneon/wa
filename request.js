function Request(title, link, duration, user){
	var data = {};
	
	data.title = title;
	data.link = link;
	data.duration = duration;
	data.user = user;
	
	return data;
}

module.exports = Request;