var http 			=	require('http');
var express			=	require('express');
//including custom module
var fortune 		=	require('./lib/fortune.js');
var credentials 	= 	require('./credentials.js');
var bodyParser  	= 	require('body-parser');
var formidable 		= 	require('formidable');
var jqupload 		= 	require('jquery-file-upload-middleware');
var nodemailer 		= 	require('nodemailer');
var Vacation 		= 	require('./models/vacation.js');
var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');
var app				=	express();

//set up handlebars view engine
var handlebars	=	require('express-handlebars').create({
	defaultLayout:'single',
	helpers: {//for section
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT || 3000);


//static middleware used for adding static to project css,javascript etc
app.use(express.static(__dirname + '/public'));

// database configuration
var mongoose = require('mongoose');
var options = {
    server: {
       socketOptions: { keepAlive: 1 } 
    }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}
// initialize vacations
Vacation.find(function(err, vacations){
    if(vacations.length) return;

    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' + 
            'enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
    }).save();

    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of rock climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing', 'hiking', 'skiing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});
// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/views/log/requests.log'}));
        break;
}

//cookie-parser to set a cookie or a signed cookie anywhere you have access
//to a request object
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));

// flash message middleware
app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

// create application/json parser
var jsonParser 			= 	bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser 	= 	bodyParser.urlencoded({ extended: false });

function getWeatherData(){
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)',
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			},
		],
	};
}

// middleware to add weather data to context
app.use(function(req, res, next){
	if(!res.locals.partials) 
		res.locals.partials 				= 	{};
		res.locals.partials.weatherContext 	= 	getWeatherData();
		next();
});

app.get('/headers', function(req,res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
});

/*
app.use(function(req,res,next){
    var cluster = require('cluster');
    if(cluster.isWorker) console.log('Worker %d received request',cluster.worker.id);
});
*/
app.get('/epic-fail', function(req, res){
	process.nextTick(function(){
		throw new Error('Kaboom!');
	});
});

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/about',function(req,res){
	//res.type('text/plain');
	//res.send('About us page');
	res.render('about', { fortune: fortune.getFortune() });
});

app.get('/jquery-test', function(req, res){
	res.render('jquery-test',{
		layout:'sectionheadjquery'
	});
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme',{
		layout:'sectionheadjquery'
	});
});

app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

var tours 		= 	[
		{ id: 0, name: 'Hood River', price: 99.99 },
		{ id: 1, name: 'Oregon Coast', price: 149.95 },
];

//Simple GET endpoint returning only JSON
app.get('/api/tours',function(req,res){
	res.json(tours);
});

//GET endpoint that returns JSON, XML, or text
app.get('/api/tours', function(req, res){
	var toursXml = '<?xml version="1.0"?><tours>' +
						products.map(function(p){
						return '<tour price="' + p.price +
						'" id="' + p.id + '">' + p.name + '</tour>';
	}).join('') + '</tours>';
		var toursText = tours.map(function(p){
			return p.id + ': ' + p.name + ' (' + p.price + ')';
	}).join('\n');

	res.format({
		'application/json': function(){
			res.json(tours);
		},
		'application/xml': function(){
			res.type('application/xml');
			res.send(toursXml);
		},
		'text/xml': function(){
			res.type('text/xml');
			res.send(toursXml);
		},
		'text/plain': function(){
			res.type('text/plain');
			res.send(toursXml);
		}
	});
});

// API that updates a tour and returns JSON; params are passed using querystring
app.put('/api/tours/:id', function(req, res){
	var p = tours.some(function(p){ 
		return p.id == req.params.id;
	});
	if( p ) {
		if( req.query.name ) p.name = req.query.name;
		if( req.query.price ) p.price = req.query.price;
		res.json({success: true});
	} else {
		res.json({error: 'No such tour exists.'});
	}
});

// API that deletes a product
app.delete('/api/tours/:id', function(req, res){
	var i;
	for( i=tours.length-1; i>=0; i-- )
		if( tours[i].id == req.params.id ) break;
		if( i>=0 ) {
			tours.splice(i, 1);
			res.json({success: true});
		} else {
			res.json({error: 'No such tour exists.'});
		}
});

//Get request for form handeling
app.get('/newsletter',function(req,res){
	res.render('newsletter',{
		csrf:'dgdfgdfg45453'
	});
});

//get request for ajax form hadleing
app.get('/newsletterjquery',function(req,res){
	res.render('newsletterjquery',{
		layout:'sectionheadjquery',
		csrf:'dgdfgdfg45453'
	});
});

//post request for processing normal and ajax form submission
app.post('/processnewsletter',urlencodedParser,function(req,res){
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
});

app.get('/thank-you',function(req,res){
	res.render('thank-you',{
	});
});

//get request for handleig file upload using formidable
app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year: now.getFullYear(),month: now.getMonth()
	});
});

//post request for fhandleing ile upload using formidable
app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

app.get('/jqfileupload',function(req,res){
	res.render('jqfileupload',{
		layout:'sectionheadjquery'
	});
});
// jQuery File Upload endpoint middleware

app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function(){
            return '/uploads/' + now;
        },
    })(req, res, next);
});

//get request for session flash
app.get('/sessionflashmsg', function(req, res){
	res.render('sessionflashmsg');
});

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}

NewsletterSignup.prototype.save = function(cb){
	cb();
};

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/sessionflashmsg',urlencodedParser, function(req, res){	
	if (!req.body) {
		res.status(404);
	}
	var fullname = req.body.fullname || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, '/sessionflashmsg/archive');
	}
	new NewsletterSignup({ name: fullname, email: email }).save(function(err){
		if(err) {
			if(req.xhr) return res.json({ error: 'Database error.' });
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, '/sessionflashmsg/archive');
		}
		if(req.xhr) return res.json({ success: true });
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/sessionflashmsg/archive');
	});
});
app.get('/sessionflashmsg/archive', function(req, res){
	res.render('sessionflashmsg/archive');
});

function Product(){
}
Product.find = function(conditions, fields, options, cb){
	if(typeof conditions==='function') {
		cb = conditions;
		conditions = {};
		fields = null;
		options = {};
	} else if(typeof fields==='function') {
		cb = fields;
		fields = null;
		options = {};
	} else if(typeof options==='function') {
		cb = options;
		options = {};
	}
	
	var products = [
		{
			name: 'Hood River Tour',
			slug: 'hood-river',
			category: 'tour',
			maximumGuests: 15,
			sku: 723,
		},
		{
			name: 'Oregon Coast Tour',
			slug: 'oregon-coast',
			category: 'tour',
			maximumGuests: 10,
			sku: 446,
		},
		{
			name: 'Rock Climbing in Bend',
			slug: 'rock-climbing/bend',
			category: 'adventure',
			//requiresWaiver: true,
			requiresWaiver: false,
			maximumGuests: 4,
			sku: 944,
		}
	];
	cb(null, products.filter(function(p) {
		if(conditions.category && p.category!==conditions.category) return false;
		if(conditions.slug && p.slug!==conditions.slug) return false;
		if(isFinite(conditions.sku) && p.sku!==Number(conditions.sku)) return false;
		return true;
	}));
};
Product.findOne = function(conditions, fields, options, cb){
	if(typeof conditions==='function') {
		cb = conditions;
		conditions = {};
		fields = null;
		options = {};
	} else if(typeof fields==='function') {
		cb = fields;
		fields = null;
		options = {};
	} else if(typeof options==='function') {
		cb = options;
		options = {};
	}
	
	Product.find(conditions, fields, options, function(err, products){
		cb(err, products && products.length ? products[0] : null);
	});
};

app.get('/tours/request-group-rate', function(req, res){
	res.render('request-group-rate',{
		layout:'sectionheadjquery'
	});
});

app.get('/tours/:tour', function(req, res, next){
	Product.findOne({ category: 'tour', slug: req.params.tour }, function(err, tour){
		if(err) return next(err);
		if(!tour) return next();
		res.render('tour', { tour: tour });
	});
});
app.get('/adventures/:subcat/:name', function(req, res, next){
	//console.log(req.params);
	Product.findOne({ category: 'adventure', slug: req.params.subcat + '/' + req.params.name  }, function(err, adventure){
		if(err) return next(err);
		if(!adventure) return next();
		res.render('adventure', { adventure: adventure});
	});
});

app.get('/vacation/:vacation', function(req, res, next){
	Vacation.findOne({ slug: req.params.vacation }, function(err, vacation){
		if(err) return next(err);
		if(!vacation) return next();
		res.render('vacation', { vacation: vacation });
	});
});

function convertFromUSD(value, currency){
    switch(currency){
    	case 'USD': return value * 1;
        case 'GBP': return value * 0.6;
        case 'BTC': return value * 0.0023707918444761;
        default: return NaN;
    }
}

app.get('/vacations', function(req, res){
    Vacation.find({ available: true }, function(err, vacations){
    	var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function(vacation){
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    inSeason: vacation.inSeason,
                    price: convertFromUSD(vacation.priceInCents/100, currency),
                    qty: vacation.qty,
                };
            })
        };
        switch(currency){
	    	case 'USD': context.currencyUSD = 'selected'; break;
	        case 'GBP': context.currencyGBP = 'selected'; break;
	        case 'BTC': context.currencyBTC = 'selected'; break;
	    }
        res.render('vacations', context);
    });
});

app.post('/vacations', function(req, res){
    Vacation.findOne({ sku: req.body.purchaseSku }, function(err, vacation){
        if(err || !vacation) {
            req.session.flash = {
                type: 'warning',
                intro: 'Ooops!',
                message: 'Something went wrong with your reservation; ' +
                    'please <a href="/contact">contact us</a>.',
            };
            return res.redirect(303, '/vacations');
        }
        vacation.packagesSold++;
        vacation.save();
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'Your vacation has been booked.',
        };
        res.redirect(303, '/vacations');
    });
});

app.get('/notify-me-when-in-season', function(req, res){
    res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', urlencodedParser,function(req, res){
    VacationInSeasonListener.update(
        { email: req.body.email }, 
        { $push: { skus: req.body.sku } },
        { upsert: true },
	    function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/vacations');
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'You will be notified when this vacation is in season.',
	        };
	        return res.redirect(303, '/vacations');
	    }
	);
});

var cartValidation = require('./lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.post('/cart/add',urlencodedParser, function(req, res, next){
	//console.log("server.js"+req.session.cart);
	var cart = req.session.cart || (req.session.cart = []);
	Product.findOne({ sku: req.body.sku }, function(err, product){
		if(err) return next(err);
		if(!product) return next(new Error('Unknown product SKU: ' + req.body.sku));
		cart.push({
			product: product,
			guests: req.body.guests || 0,
		});
		//console.log("server.js afte assign"+req.session.cart);
		res.redirect(303, '/cart');
	});
});

app.get('/cart', function(req, res){
	var cart = req.session.cart || (req.session.cart = []);
	res.render('cart', { cart: cart });
});

app.get('/cart/checkout', function(req, res, next){
	var cart = req.session.cart;
	console.log(cart);
	if(!cart) next();
	res.render('cart-checkout');
});

app.post('/cart/checkout',urlencodedParser, function(req, res){
	var cart = req.session.cart;
	if(!cart) next(new Error('Cart does not exist.'));
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) return res.next(new Error('Invalid email address.'));
	// assign a random cart ID; normally we would use a database ID here
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
    res.render('email/cart-thank-you', 
    	{ layout: null, cart: cart }, function(err,html){
	        if( err ) console.log('error in email template');
	        /*emailService.send(cart.billing.email,
	        	'Thank you for booking your trip with Meadowlark Travel!',
	        	html);*/
	    }
    );
    res.render('cart-thankyou', { cart: cart });
});

app.get('/email/cart/thank-you', function(req, res){
	res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
});

app.get('/cart-thankyou', function(req, res){
	res.render('cart-thank-you', { cart: req.session.cart });
});



//using Mail Submission Agent (MSA) like Gmail
var smtpConfig 		= 	{
		service: 'gmail',
	    host: 'smtp.gmail.com',
	    port: 465,
	    //secure: true, // use SSL
	    auth: {
	        user: credentials.gmail.user,
	        pass: credentials.gmail.password
	    }
};

var mailTransporter = 	nodemailer.createTransport(smtpConfig);

app.get('/sendmail',function(req,res){
	// verify connection configuration
	mailTransporter.verify(function(error, success) {
	   if (error) {
	        console.log(error);
	   } else {
	        console.log('Server is ready to take our messages');
	   }
	});

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: '"Diillip 👥" <dillippradhan1988@gmail.comm>', // sender address
	    to: 'dillippradhan1988@gmail.com', // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world 🐴', // plaintext body
	    html: '<b>Hello world 🐴</b>', // html body
	    attachments: [
	        {   // utf-8 string as an attachment
	            filename: 'text1.txt',
	            content: 'hello world!'
	        }
        ]
	};
	
	// send mail with defined transport object
	mailTransporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	    res.send('Message sent: ' + info.response);
	});
});

//custom 404 page
app.use(function(req,res,next){	
	res.status(404);
	res.render('notfound');
});

//505 internal servel error
app.use(function(err,req,res,next){
	console.error(err.stack);	
	res.status(500);
	res.render('500');
});

/*app.listen(app.get('port'), function(){
	console.log( 'Express started in ' + app.get('env') +
	' mode on http://localhost:' + app.get('port') +
	'; press Ctrl-C to terminate.' );
});*/

var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}