module.exports 			= 	function(app){
	// miscellaneous routes
	app.get('/headers', function(req, res){
		console.log(req.params);
		res.set('Content-Type','text/plain');
		var s = '';
		for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
		res.send(s);
	});
};