var express 	= 	require('express');
var app			=	express();	

//set up handlebars view engine
var handlebars	=	require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//static middleware used for adding static to project css,javascript etc
app.use(express.static(__dirname + '/public'));

//including custom module
var fortune 	=	require('./lib/fortune.js');

app.set('port',process.env.PORT || 3000);

app.get('/headers', function(req,res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
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
app.get('/',function(req,res){
	//res.type('text/plain');
	//res.send('home page');
	res.render('home');
});

app.get('/about',function(req,res){
	//res.type('text/plain');
	//res.send('About us page');
	res.render('about', { fortune: fortune.getFortune() });
});

//custom 404 page
app.use(function(req,res,next){
	//res.type('text/plain');
	res.status(404);
	//res.send('404 - Not Found');
	res.render('400');
});

//505 internal servel error
app.use(function(err,req,res,next){
	console.error(err.stack);
	//res.type('text/plain');
	res.status(500);
	//res.send('500 - Server Error');
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
	app.get('port') + '; press Ctrl-C to terminate.' );
});