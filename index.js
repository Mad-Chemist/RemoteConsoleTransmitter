const PORT = 3000;
const STYPE = "logPayload";
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('connection established');

  socket.on('disconnect', function() {
    console.log('connection disconnected');
  });

  socket.on(STYPE, function(messages) {
  	let parsed = JSON.parse(messages);
  	parsed && parsed.length > 0 && parsed.forEach(function(message) {
  		socket.broadcast.emit("log", message.replace("]", "] [" + socket.id + "]"));
  	});
  });
});

http.listen(PORT, function() {
  console.log('listening on *:' + PORT);
});