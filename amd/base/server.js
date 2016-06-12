var express     =   require('express');
var app         =   express();
var http        =   require('http');

app.set('port',process.env.PORT || 3000);

//var foo = require('./foo');
//var bar = require('./bar');

define(['./foo', './bar'], function(foo, bar){
    // continue code here
});

http.createServer(app).listen(app.get('port'), function(){
  console.log( 'Express started in ' + app.get('env') +
    ' mode on http://localhost:' + app.get('port') +
    '; press Ctrl-C to terminate.' );
});