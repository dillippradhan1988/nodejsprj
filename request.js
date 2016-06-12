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

//Anonymous Function or first-class functions (function can be treaated as variables)
/*var foo1 = function namedFunction() { // no use of name, just wasted characters
    console.log('foo1');
}
foo1(); // foo1
 
var foo2 = function () {
    // no function name given i.e. anonymous function
    console.log('foo2');
}
foo2(); // foo2
*/



//Higher-Order Functions
//Functions that take functions as arguments are called higher-order functions.
/*setTimeout(function () {
    console.log('2000 milliseconds have passed since this demo started');
}, 2000);

function foo() {
    console.log('2000 milliseconds have passed since this demo started');
}
setTimeout(foo, 2000);
*/



//Closures
//Whenever we have a function defined inside another function, the inner function has access to the variables declared
//in the outer function.
/*function outerFunction(arg) {
    var variableInOuterFunction = arg;
     
    function bar() {
        console.log(variableInOuterFunction); // Access a variable from the outer scope
    }
     
    // Call the local function to demonstrate that it has access to arg
    bar();
} 
outerFunction('hello closure!');
// logs hello closure!
*/
/*function outerFunction(arg) {
    var variableInOuterFunction = arg;
    return function () {
        console.log(variableInOuterFunction);
    }
}
 
var innerFunction = outerFunction('hello closure!');
 
// Note the outerFunction has returned
innerFunction(); // logs hello closure!
*/


/*function first(data, cb) {
    console.log('Executing first');
    setTimeout(cb, 1000, data);
} 
function second(data, cb) {
    console.log('Executing second');
    setTimeout(cb, 1000, data);
} 
function third(data, cb) {
    console.log('Executing third');
    setTimeout(cb, 1000, data);
} 
first('data', function (text1) {
    second(text1, function (text2) {
        third(text2, function (text3) {
            console.log('done:', text3); // indented
        });
    });
});
*/

/*function first(data, cb) {  
    console.log('Executing first');  
    setTimeout(cb, 1000, data);    
} 
function second(data, cb) {
    console.log('Executing second');
    setTimeout(cb, 1000, data);
} 
function third(data, cb) {
    console.log('Executing third');
    setTimeout(cb, 1000, data);
} 

function handleCallback1(text1){
    second(text1,handleCallback2);
}
function handleCallback2(text2){
    third(text2,handleCallback3);
}
function handleCallback3(text3){
    console.log('done:', text3); // indented
}

first('data',handleCallback1);
*/






app.get('/',function(req,res,next){    
    res.end('Hello');
});

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