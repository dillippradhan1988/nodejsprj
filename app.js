var express		=	require('express');
var app			=	express();


require('./lib/fortune.js')(app);



var server		=	app.listen('3000',function(){
	console.log('Express server listening on port ' + server.address().port);
});