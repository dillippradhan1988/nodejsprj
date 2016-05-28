var express           =   require('express');
var app               =   express();
var http              =   require('http').Server(app);
var CookieParser      =   require('cookie-parser');
var SECRET            =   'hellonihao';
var COOKIENAME        =   'hello';
var cookieParser      =   CookieParser(SECRET);
var bodyParser        =   require('body-parser');
var ExpressSession    =   require('express-session');
var Vacation          =   require('./models/vacation.js');

// view engine setup
var handlebars        =	  require('express-handlebars').create({
	defaultLayout:'mongodbpubsub',
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

var credentials       = 	require('./credentials.js');
var MongoSessionStore = 	require('session-mongoose')(require('connect'));
var sessionStore      = 	new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });

var session           =   ExpressSession({
    store: sessionStore,
    secret: SECRET,
    resave: true,
    saveUninitialized: true
});

// database configuration
var mongoose          =   require('mongoose');
var options           =   {
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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session);
app.use(express.static(__dirname + '/public'));


app.get('/mongopubsub',function(req,res){  
	 Vacation.find({ available: true }, function(err, vacations){
	   if(err) return next(err);
	   if(!vacations) return new Error("No vacations found");
    	var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function(vacation){
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    inSeason: vacation.inSeason,
                    price: vacation.priceInCents,
                    qty: vacation.qty,
                }
            })
        };
        switch(currency){
	    	case 'USD': context.currencyUSD = 'selected'; break;
	        case 'GBP': context.currencyGBP = 'selected'; break;
	        case 'BTC': context.currencyBTC = 'selected'; break;
	    }
      return res.render('vacations/getallvacations', context);
    });
});

app.get('/',function(req,res){
  return res.render('mongodbpubsub');
});

var socketIO          =   require('socket.io');
var io                =   socketIO(http);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('getAllVacationPubSub', function(msg){      
        Vacation.find({    }, function(err, vacations){
            console.log('inside mongo');
      	    if(err) return next(err);
      	    if(!vacations) return new Error("No vacations found");
        	  var currency = 'USD';
            var context = {
                currency: currency,
                vacations: vacations.map(function(vacation){
                    return {
                        sku: vacation.sku,
                        name: vacation.name,
                        description: vacation.description,
                        inSeason: vacation.inSeason,
                        price: vacation.priceInCents,
                        qty: vacation.qty,
                    }
                })
            };
			io.emit('getAllVacationPubSub', JSON.stringify(context));
        });
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
app.cookieParser      =   cookieParser;
app.session           =   session;

//module.exports = app;

http.listen(app.get('port'), function(){
    console.log('listening on http://localhost:'+app.get('port'));
});