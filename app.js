var express = require('express');
var path = require('path');
var app         =   express();
var http        =   require('http').Server(app);
var CookieParser = require('cookie-parser');
var SECRET = 'hellonihao';
var COOKIENAME = 'hello';
var cookieParser = CookieParser(SECRET);
var bodyParser = require('body-parser');
var ExpressSession = require('express-session');

/*var connectRedis = require('connect-redis');
var RedisStore = connectRedis(ExpressSession);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});
*/
var credentials 				= 	require('./credentials.js');
var MongoSessionStore 	= 	require('session-mongoose')(require('connect'));
var sessionStore 		= 	new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });

var session = ExpressSession({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
});

// view engine setup
var handlebars	=	require('express-handlebars').create({
	defaultLayout:'chat',
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
app.set('port',3000);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));


// setup routes
var routes = require('./routes/index');
app.use('/', routes);


/*
* enable node cluster and sticky-session
*/
// var sticky = require('sticky-session');
// sticky(server);

/*
* setup socket.io, and socket-session
*/
var socketIO = require('socket.io');
var io = socketIO(http);

var socketIOExpressSession = require('socket.io-express-session'); 
io.use(socketIOExpressSession(app.session)); // session support
var setEvents = require('./events');
setEvents(io);
//var SessionSocket = require('session.socket.io');
//var sessionSockets = new SessionSocket(io, app.sessionStore, app.cookieParser);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('notfound', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('notfound', {
    message: err.message,
    error: {}
  });
});

// passing the session store and cookieParser
//app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
app.session = session;

//module.exports = app;

http.listen(process.env.PORT, function(){
    console.log('listening on http://localhost:'+process.env.PORT);
});