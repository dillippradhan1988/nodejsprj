exports.requestGroupRate = function(req, res){
	res.render('contact/request-group-rate',{
		layout:'sectionheadjquery'
	});
}

exports.requestGroupRatePost = function(req, res, next){
	next(new Error('Request group rate processing not yet implemented!'));
}

exports.home = function(req, res, next){
	next(new Error('Contact page not yet implemented!'));
}

exports.homePost = function(req, res, next){
	next(new Error('Contact page not yet implemented!'));
}