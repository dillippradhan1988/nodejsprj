var express     =   require('express');
var app         =   express();
var http        =   require('http').Server(app);
var io          =   require('socket.io')(http);
var fs		    =	require('fs');

//set up handlebars view engine
var handlebars	=	require('express-handlebars').create({
	defaultLayout:'chatserver',
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

//static middleware used for adding static to project css,javascript etc
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('chat/chatclient',{
        layout:'chatserver'
    });
});

app.get('/fileread', function(req, res){
    fs.readFile(__dirname + '/views/chat/client.html', function(err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading client.html');
        }
        res.writeHead(200);
        res.end(data);
    });
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    
    /*console.log(__dirname);
    // watching the xml file
    fs.watchFile(__dirname + '/views/chat/example.xml', function(curr, prev) {
        // on file change we can read the new xml
        fs.readFile(__dirname + '/views/chat/example.xml', function(err, data) {
            if (err) throw err;
            // parsing the new xml data and converting them into json file
            var json = parser.toJson(data);
            // send the new data to the client
            socket.volatile.emit('notification', json);
        });
    });*/
});


http.listen(process.env.PORT, function(){
    console.log('listening on http://localhost:'+process.env.PORT);
});