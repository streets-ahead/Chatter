var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	io = require('socket.io'),
	formidable = require('formidable'),
	sys = require('sys');

function handleUpload(req, res) {
	var form = new formidable.IncomingForm();
	form.uploadDir = 'uploads';
	form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
		res.writeHead(200, {'content-type': 'text/plain'});
		res.write('received upload:\n\n');
		res.end(sys.inspect({fields: fields, files: files}));
		console.log(roomlist);
		console.log(fields['room']);
		roomlist[fields['room']].sendMessage( generateMessage('newimage', ['url', '"' + files.upload.path + '"']) );
   	});
}

var endsWith = function(fullstr, substr) {
	return (fullstr.match(substr+"$") == substr);
}

function handleOther(uri, request, response) {
	var filename = path.join(process.cwd(), uri);
console.log(uri);
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
			
			if(endsWith(uri, '.eot')) {
				response.writeHead(200, {'Content-Type': 'application/vnd.ms-fontobject'});
			} else if (endsWith(uri, '.ttf') ){
				response.writeHead(200, {'Content-Type': 'font/ttf'});
			} else if ( endsWith(uri, '.otf') ) {
				response.writeHead(200, {'Content-Type': 'font/otf'});
			} else {
				response.writeHead(200);
			}
			response.end(file);
		});
	} );
}
	
server = http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname;
	console.log(uri);
	switch(uri){
		case "/upload":
			handleUpload(request, response);
			break;
		case "/": 
			uri = "/index.htm";
		default:
			handleOther(uri, request, response);
	}
});

server.listen(8080);
console.log("listening on 8080");

var listener = io.listen(server);

var roomlist = new Object();
var globalUserList = new Object();

var generateMessage = function(type, fields) {
	var jsonstr = '{"type":"' + type + '",';
	for(var i = 0; i < fields.length; i+=2) {
		jsonstr += '"' + fields[i] + '":';
		jsonstr += fields[i+1] + (i+2 < fields.length ? ',': '');
	}
	jsonstr += '}';
	
	return jsonstr;
}

var room = function(name) {
	this.name = name;
	this.userlist = new Object();
	
	this.addUser = function (userid, message) {
		console.log('adding user' + message.user);
		this.sendMessage(message);
		this.userlist['uid' + userid] = message.user;
	}
	
	this.removeUser = function (userid) {
		console.log('removing user ' + userid);
		delete this.userlist['uid' + userid];
		var removeMessage = generateMessage('removeuser', ['userid', '"uid' + userid + '"']);
		this.sendMessage(removeMessage);
	}
	
	this.sendMessage = function(message) {
		
		var messageStr;
		if(typeof message === 'string'){
			messageStr = message
		} else {
			messageStr = JSON.stringify(message);
		}
		console.log('sending message ' + messageStr);
		for(userid in this.userlist) {
			listener.clientsIndex[userid.substr(3)].send(messageStr);
		}
	}
}

listener.on('connection', function(client){ 
	client.on('message', function(data){ 
		var message = JSON.parse(data);
		console.log(message);
		switch(message.type) {
			case 'newuser':
				if(!roomlist[message.room]) {
					roomlist[message.room] = new room(message.room);
				} 
				
				var usersRoom = roomlist[message.room];
				message.userid = 'uid' + client.sessionId;
				usersRoom.addUser(client.sessionId, message);
				globalUserList[client.sessionId] = usersRoom;
				
				var userliststr = JSON.stringify(usersRoom.userlist);
				var userlistMessage = generateMessage('userlist', ['userlist', userliststr]);
				
				listener.clientsIndex[client.sessionId].send( userlistMessage );
				listener.clientsIndex[client.sessionId].send('comment', ['comment', 
																		'"Welcome to Chatter, a fun experiment from the folks at ' + 
																		'<a href=\'http://streetsaheadllc.com\' target=\'_blank\'>Streets Ahead LLC</a>."', 
																		'user', 
																		'{"username":"Streets Ahead", "typing":false}']));
				break;
			case 'comment':
				var usersRoom = globalUserList[client.sessionId];
				usersRoom.sendMessage(data);
				break;
			case 'typing':
				var usersRoom = globalUserList[client.sessionId];
				usersRoom.sendMessage(data);
				break;
		}
	});
	
	client.on('disconnect', function() {
		var userRoom = globalUserList[client.sessionId];
		if(userRoom) {
			console.log('removing disconected user ' + client.sessionId + ' ' + userRoom);
			delete globalUserList[client.sessionId];
			userRoom.removeUser(client.sessionId);
		}	
	});
});

process.openStdin().addListener("data", function(text) {
	console.log('broadcasting message ' + text);
	listener.broadcast(text);
});