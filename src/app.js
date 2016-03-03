//get the HTTP module and create a server. This time we will store the returned server as "app"
var app = require('http').createServer(handler);
//grab socketio and pass in our server "app" to create a new socketio server running inside of our HTTP server
//Socket.io can also run individually, but in this case we want it to run with our webpages, so we will use the module's
//option to allow us to embed it
var io = require('socket.io')(app);
//grab our file system 
var fs = require('fs');

//get the PORT for the server
//Remember we use process.env.PORT or process.env.NODE_PORT to check if we are running on a server
//that already has set ports in the environment configuration
var PORT = process.env.PORT || process.env.NODE_PORT || 3000;

//tell your server to listen on the port
app.listen(PORT);

// draw array
var draws = {};

//Overall object to show maintained by the server
var square = {
    lastUpdate: new Date().getTime(),
    x: 0,
    y: 0,
    height: 100,
    width: 100
};

//Our HTTP server handler. Remember with an HTTP server, we always receive the request and response objects
function handler (req, res) {
  //read our file ASYNCHRONOUSLY from the file system. This is much lower performance, but allows us to reload the page
  //changes during development. 
  //First parameter is the file to read, second is the callback to run when it's read ASYNCHRONOUSLY
  fs.readFile(__dirname + '/../client/index.html', function (err, data) {
    //if err, throw it for now
    if (err) {
      throw err;
    }
	
	res.writeHead(200);
    res.end(data);
  });
}

//When new connections occur on our socket.io server (we receive the new connection as a socket in the parameters)
io.on('connection', function (socket) {
  
    socket.join('room1');
	
	// Uses initial data to draw client square
    socket.on('initial', function(data) {
		draws[data.time] = data.coords;
		var message =
		{
			message: "",
			data: draws
		}
	 
    io.sockets.in('room1').emit('update', message); 
  });
  

  socket.on('disconnect', function(data) {
	  delete draws[data.time];
    socket.leave('room1');
  });
});

console.log("listening on port " + PORT);