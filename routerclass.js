var http 			=	require('http');
var express			=	require('express');
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

var users = {
	'dillip': {
		email: 'hi@azat.co',
		website: 'http://azat.co',
		blog: 'http://webapplog.com'
  	}
};

var findByUserName	=	function(username,callback){
	if(!users[username]) return callback(new Error('No user matching user name '+username));
	return callback(null,users[username]);
};

app.get('/v1/users/:username',function(req,res,next){
	var username = req.params.username;
	findByUserName(username,function(error,user){
		if(error) return next(error);
		return res.render('routes/user',{
			user:user
		});
	});
});

app.get('/v1/admin/:username',function(req,res,next){
	var username = req.params.username;
	findByUserName(username,function(error,user){
		if(error) return next(error);
		return res.render('routes/admin',{
			'user':user	
		});
	});
});

var findByUserNameMiddleware 	= function(req,res,next){
	if(req.params.username){
		var username = req.params.username;
		findByUserName(username,function(error,user){
			if(error) return next(error);
			req.user = user;
			return next();
		});
	}else{
		return next();
	}
};

app.get('/v2/users/:username',findByUserNameMiddleware,function(req,res,next){
	return res.render('routes/user',{
		user:req.user
	});
});

app.get('/v2/admin/:username',findByUserNameMiddleware,function(req,res,next){
	return res.render('routes/admin',{
		user:req.user
	});
});

app.param('v3username',function(req,res,next,username){
	findByUserName(username,function(error,user){
		if(error) return next(error);
		req.user = user;
		return next();
	});
});

app.get('/v3/users/:v3username',function(req,res,next){
	return res.render('routes/user',{
		'user':req.user	
	});
});
app.get('/v3/admin/:v3username',function(req,res,next){
	return res.render('routes/admin',{
		user:req.user
	});
});

var router 			= 	express.Router();

router.param('username',function(req,res,next,username){
	findByUserName(username,function(error,user){
		if(error) return next(error);
		req.user = user;
		return next();
	});
});

router.get('/users/:username',function(req,res,next){
	return res.render('routes/users',{
		user:req.user
	});
});

router.get('/admin/:username',function(req,res,next){
	return res.render('routes/admin',{
		user:req.user
	});
});

app.use('/v4',router);

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