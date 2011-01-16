var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	io = require('socket.io');
	
server = http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	
	if(uri == "/") {
		uri = "/index.htm"
	}
	
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
	var userJSON = JSON.stringify( {"userlist":userList} );	
	listener.broadcast(userJSON);
}

var generateMessage = function(type, fields) {
	var jsonstr = '{"type":"' + type + '",';
	for(var i = 0; i < fields.length; i+=2) {
		jsonstr += '"' + fields[i] + '":';
		jsonstr += fields[i+1] + (i+2 < fields.length ? ',': '');
	}
	jsonstr += '}';
	
	return jsonstr;
}

listener.on('connection', function(client){ 
	client.on('message', function(data){ 
		var post = JSON.parse(data);
		
		switch (post.type) {
			case 'newuser':
				connectedUsers['sid' + client.sessionId] = post.user;
				updateUsers();
				break;
			case 'typing':
				listener.broadcast(data);
				break;
			case 'comment':
				listener.broadcast(data);
				break;
		}
		
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