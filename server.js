var express			=	require('express');
//including custom module
var fortune 		=	require('./lib/fortune.js');
var bodyParser  	= 	require('body-parser');
var formidable 		= 	require('formidable');
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
		res.locals.partials = {};
	res.locals.partials.weatherContext = getWeatherData();
	next();
});

app.get('/headers', function(req,res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
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
		return p.id == req.params.id
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
	for( var i=tours.length-1; i>=0; i-- )
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

//custom 404 page
app.use(function(req,res,next){	
	res.status(404);
	res.render('400');
});

//505 internal servel error
app.use(function(err,req,res,next){
	console.error(err.stack);	
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
	app.get('port') + '; press Ctrl-C to terminate.' );
});