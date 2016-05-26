var http 			=	require('http');
var express			=	require('express');
var app				=	express();
var ccookieParser   =   require('cookie-parser');
var bodyParser      =   require('body-parser');
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

app.use(bodyParser.urlencoded());
app.use(ccookieParser());

app.get('/search',function(req,res,next){
    console.log(req.query);
    res.end(JSON.stringify(req.query));
});

app.get('param/:role/:name/:status',function(req,res,next){
   console.log(req.params); 
});

app.post('/body',function(req,res,next){
    console.log(req.body);
});

app.get('/cookies',function(req,res,next){
    if(!req.cookies.counter) 
        res.cookie('counter',0);
    else
        res.cookie('counter',parseInt(req.cookies.counter,10)+1);
        
    res.status(200).send("cookies are "+JSON.stringify(req.cookies));
});

app.get('/signed-cookies',function(req,res,next){
    if(!req.cookies.counter) 
        res.cookie('counter',0,{signed:true});
    else
        res.cookie('counter',parseInt(req.cookies.counter,10)+1,{signed:true});
        
    res.status(200).send("cookies are "+JSON.stringify(req.cookies));
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