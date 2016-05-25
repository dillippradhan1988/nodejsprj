var http 						=	require('http');
var express						=	require('express');
var fs 							= 	require('fs');
var nodemailer 					= 	require('nodemailer');
var jqupload 					= 	require('jquery-file-upload-middleware');
var bodyParser                  =   require('body-parser');
var vhost                       =   require('vhost');
var credentials 				= 	require('./credentials.js');
var Vacation 					= 	require('./models/vacation.js');
var vacationInSeasonListener 	= 	require('./models/vacationInSeasonListener.js');

var app							=	express();

//set up handlebars view engine
var handlebars	=	require('express-handlebars').create({
	defaultLayout:'single',
	helpers: {//for section
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		},
		static: function(name) {
            return require('./lib/static.js').map(name);
        }
	}
});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

// set up css/js bundling
//var bundler = require('connect-bundle')(require('./config.js'));
///app.use(bundler);

app.set('port',process.env.PORT || 3000);

// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(error){
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
        break;
}

var MongoSessionStore 	= 	require('session-mongoose')(require('connect'));
var sessionStore 		= 	new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });

//cookie-parser to set a cookie or a signed cookie anywhere you have access
//to a request object
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    //store: sessionStore
}));

//static middleware used for adding static to project css,javascript etc
app.use(express.static(__dirname + '/public'));

// CSRF middleware for form
app.use(require('csurf')());
app.use(function(req, res, next){
    res.locals._csrfToken = req.csrfToken();
next();
});

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

// flash message middleware
app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

//mocked wheather data
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


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

//using Mail Submission Agent (MSA) like Gmail
var smtpConfig      =   {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        //secure: true, // use SSL
        auth: {
            user: credentials.gmail.user,
            pass: credentials.gmail.password
        }
};
var mailTransporter =   nodemailer.createTransport(smtpConfig);
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

// create "admin" subdomain...this should appear
// before all your other routes
var admin       =   express.Router();
app.use(vhost('admin.*', admin));
// create admin routes; these can be defined anywhere
admin.get('/', function(req, res){
    res.render('admin/home');
});


// add routes
require('./routes.js')(app);

// api
var Attraction  =   require('./models/attraction.js');

var rest        =   require('connect-rest');

rest.get('/attractions', function(req, content, cb){
    Attraction.find({ approved: true }, function(err, attractions){
        if(err) return cb({ error: 'Internal error.' });
        cb(null, attractions.map(function(a){
            return {
                name: a.name,
                description: a.description,
                location: a.location,
            };
        }));
    });
});

rest.post('/attraction', function(req, content, cb){
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    a.save(function(err, a){
        if(err) return cb({ error: 'Unable to add attraction.' });
        cb(null, { id: a._id });
    }); 
});

rest.get('/attraction/:id', function(req, content, cb){
    Attraction.findById(req.params.id, function(err, a){
        if(err) return cb({ error: 'Unable to retrieve attraction.' });
        cb(null, { 
            name: a.name,
            description: a.description,
            location: a.location,
        });
    });
});

// API configuration
var apiOptions = {
    context: '/',
    domain: require('domain').create(),
};

apiOptions.domain.on('error', function(err){
    console.log('API domain error.\n', err.stack);
    setTimeout(function(){
        console.log('Server shutting down after API domain error.');
        process.exit(1);
    }, 5000);
    server.close();
    var worker = require('cluster').worker;
    if(worker) worker.disconnect();
});


// link API into pipeline
app.use(rest.rester(apiOptions));

//app.use(vhost('api.*', rest.rester(apiOptions)));
// link API into pipeline
// currently commented out to reduce console noise
//app.use(vhost('api.*', rest.rester(apiOptions)));

// authentication
var auth = require('./lib/auth.js')(app, {
    baseUrl: process.env.BASE_URL,
    providers: credentials.authProviders,
    successRedirect: '/account',
    failureRedirect: '/unauthorized',
});
// auth.init() links in Passport middleware:
auth.init();

// now we can specify our auth routes:
auth.registerRoutes();

// authorization helpers
function customerOnly(req, res, next){
    if(req.user && req.user.role==='customer') return next();
    // we want customer-only pages to know they need to logon
    res.redirect(303, '/unauthorized');
}
function employeeOnly(req, res, next){
    if(req.user && req.user.role==='employee') return next();
    // we want employee-only authorization failures to be "hidden", to
    // prevent potential hackers from even knowhing that such a page exists
    next('route');
}
function allow(roles) {
    return function(req, res, next) {
        if(req.user && roles.split(',').indexOf(req.user.role)!==-1) return next();
        res.redirect(303, '/unauthorized');
    };
}

app.get('/unauthorized', function(req, res) {
    res.status(403).render('unauthorized');
});

// customer routes

app.get('/account', allow('customer,employee'), function(req, res){
    res.render('account', { username: req.user.name });
});
app.get('/account/order-history', customerOnly, function(req, res){
    res.render('account/order-history');
});
app.get('/account/email-prefs', customerOnly, function(req, res){
    res.render('account/email-prefs');
});

// employer routes
app.get('/sales', employeeOnly, function(req, res){
    res.render('sales');
});

// add support for auto views
var autoViews = {};

app.use(function(req,res,next){
    var path = req.path.toLowerCase();  
    // check cache; if it's there, render the view
    if(autoViews[path]) return res.render(autoViews[path]);
    // if it's not in the cache, see if there's
    // a .handlebars file that matches
    if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
        autoViews[path] = path.replace(/^\//, '');
        return res.render(autoViews[path]);
    }
    // no view found; pass on to 404 handler
    next();
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