var lazybum = require('lazyBum'),
	socketio = require('socket.io');

var server = new lazybum.RestServer(),
	io = socketio.listen(server.server),
	httpServer = server.startServer();

io.of('/chatter').on('connection', function(socket) {
	console.log(socket);
	socket.on('message', function(data) {
		console.log(data);
	});
});
