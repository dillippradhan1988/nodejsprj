var main 				= 	require('./handlers/main.js');
var contest 			= 	require('./handlers/contest.js');
var vacation 			= 	require('./handlers/vacation.js');
var cart 				= 	require('./handlers/cart.js');
var cartValidation 		= 	require('./lib/cartValidation.js');
var contact 			= 	require('./handlers/contact.js');
var samples 			= 	require('./handlers/samples.js');

module.exports 			= 	function(app){
	// miscellaneous routes
	app.get('/headers', main.headers);
	app.get('/', main.home);
	app.get('/about', main.about);
	app.get('/newsletter', main.newsletter);
	app.post('/newsletter', main.newsletterpost);
	app.get('/newsletterjquery', main.newsletterjquery);
	app.post('/newsletterjquery', main.newsletterjquerypost);
	app.get('/newsletter/archive', main.newsletterArchive);
	app.get('/thank-you', main.genericThankYou);

	// contest routes
	app.get('/contest/vacation-photo', contest.vacationPhoto);
	app.post('/contest/vacation-photo/:year/:month', contest.vacationPhotoPost);
	app.get('/contest/vacation-photo/entries', contest.vacationPhotoEntries);

	// vacation routes
	app.get('/vacations', vacation.getAllVacation);
	app.get('/vacation/:vacation', vacation.getVacationDetail);
	app.get('/notify-me-when-in-season', vacation.notifyWhenInSeason);
	app.post('/notify-me-when-in-season', vacation.notifyWhenInSeasonPost);

	//adventure
	app.get('/tours/request-group-rate',cart.requestGroupRate);
	app.get('/tours/:tour', cart.tours);
	app.get('/adventures/:subcat/:name', cart.adventures);

	// shopping cart routes
	app.get('/cart', cart.middleware, cartValidation.checkWaivers, cartValidation.checkGuestCounts, cart.home);
	app.get('/cart/add', cart.addProcessGet);
	app.post('/cart/add',cart.addProcessPost);
	app.get('/cart/checkout', cart.checkout);
	app.post('/cart/checkout', cart.checkoutProcessPost);
	app.get('/cart/thank-you', cart.thankYou);
	app.get('/email/cart/thank-you', cart.emailThankYou);
	app.get('/set-currency/:currency', cart.setCurrency);

	// contact
	app.get('/request-group-rate', contact.requestGroupRate);
	app.post('/request-group-rate', contact.requestGroupRatePost);
	app.get('/contact', contact.home);
	app.post('/contact', contact.homePost);

	// testing/sample routes
	app.get('/jquery-test', samples.jqueryTest);
	app.get('/jqfileupload', samples.jqfileupload);
	app.get('/nursery-rhyme', samples.nurseryRhyme);
	app.get('/data/nursery-rhyme', samples.nurseryRhymeData);
	app.get('/epic-fail', samples.epicFail);
};