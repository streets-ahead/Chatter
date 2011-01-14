var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	io = require('socket.io');
	
server = http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), uri);
	path.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {'Content-Type':'text/plain'});
			response.end("File not found, looser");
			return;
		}
		
		fs.readFile(filename, function(err, file) {
			if(err) {
				response.writeHead(500, {'Content-Type':'text/plain'});
				response.end(err + '\n');
				return;
			}
			
			response.writeHead(200);
			response.end(file);
		});
	} );
});

server.listen(8080);
console.log("listening on 8080");

var listener = io.listen(server);
var connectedUsers = {};
var userList;

function updateUsers() {
	userList = new Array();
	
	for(var sessionId in connectedUsers) {
		if(sessionId.indexOf('sid') == 0) {
			userList.push( connectedUsers[sessionId] );
		}
	}
	
	var userJSON = JSON.stringify( {"userlist":userList} );	
	listener.broadcast(userJSON);
}

listener.on('connection', function(client){ 
	client.on('message', function(data){ 
		var post = JSON.parse(data);
		if(post.comment == "") {
			connectedUsers['sid' + client.sessionId] = post;
			updateUsers();
		} else {
			listener.broadcast(data);
		}
	});
	
	client.on('disconnect', function() {
		delete connectedUsers['sid' + client.sessionId];
		updateUsers();
	});
});

process.openStdin().addListener("data", function(text) {
	listener.broadcast(text);
});