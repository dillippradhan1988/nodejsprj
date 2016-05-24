var fortune 		= 	require('../lib/fortune.js');

exports.headers 		= 	function(req, res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
};

exports.home 		= 	function(req, res){
	res.render('home');
};

exports.about 		= 	function(req, res){
	res.render('about', { 
		fortune: fortune.getFortune() 
	} );
};

exports.newsletter 	= 	function(req, res){
	res.render('newsletter/newsletter',{
		csrf:'dgdfgdfg45453'
	});
};

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
//post request for processing normal form
exports.newsletterpost = function(req, res){
	if (!req.body) {
		res.status(404);
	}
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, 'newsletter/archive');
	}
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
			if(req.xhr) return res.json({ error: 'Database error.' });
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, 'newsletter/archive');
		}
		if(req.xhr) return res.json({ success: true });
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, 'newsletter/archive');
	});
}

exports.newsletterjquery 	= 	function(req, res){
	res.render('newsletter/newsletterjquery',{
		layout:'sectionheadjquery',
		csrf:'dgdfgdfg45453'
	});
};

//post request for processing normal and ajax form submission
exports.newsletterjquerypost 	= 	function(req,res){
	if (!req.body) 
		return res.sendStatus(400);
	if(req.xhr || req.accepts('json,html')==='json'){
		// if there were an error, we would send { error: 'error description' }
		res.send({ success: true });
	} else {
		console.log('CSRF token (from hidden form field): ' + req.body._csrf);
		console.log('Name (from visible form field): ' + req.body.name);
		console.log('Email (from visible form field): ' + req.body.email);		
		// if there were an error, we would redirect to an error page
		res.redirect(303, '/thank-you');
	}
}

exports.newsletterArchive = function(req, res){
	res.render('newsletter/archive');
}

exports.genericThankYou = function(req, res){
	res.render('thank-you');
}

/*Contest*/
exports.newsletterArchive = function(req, res){
	res.render('newsletter/archive');
}

exports.genericThankYou = function(req, res){
	res.render('thank-you');
}