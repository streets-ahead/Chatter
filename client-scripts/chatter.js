// when deployed to the server need to change to var socket = new io.Socket('chatterapp.info', {"port":8080});
var socket = new io.Socket();

var Chatter = function() {
	var that = this;
	
	that.numPosts = 0;
	that.username = 'Coward';
	that.typing = false;
	that.infocus = true;
	that.room = ' The Party'

	var blinkInterval;
	
	//not very safe
	that.generateMessage = function(type, fields) {
		var jsonstr = '{"type":"' + type + '",';
		for(var i = 0; i < fields.length; i+=2) {
			jsonstr += '"' + fields[i] + '":';
			jsonstr += fields[i+1] + (i+2 < fields.length ? ',': '');
		}
		jsonstr += '}';
		
		return jsonstr;
	}
	
	that.handlePost = function (post) {
		that.numPosts++;
		var today = new Date();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		$('#chats').append('<div class="post" id="post' + that.numPosts + '" style="display:none">' + 
								'<p class="username">user: ' + post.user.username + '<span style="float:right">' + time + '</span></p>' +
								'<p class="comment">' + post.comment + '</p>' +
							'</div>');
		$('#post' + that.numPosts).fadeIn();
		$("#chats").attr({ scrollTop: $("#chats").attr("scrollHeight") });
	}
	
	that.connect = function () {
		socket.connect();
		var newUserMessage = that.generateMessage('newuser', ['user', '{"username":"' + that.username + '", "typing":' + that.typing + '}', 
																'room', '"' + that.room + '"']);
		console.log(newUserMessage);
		that.send( newUserMessage );

		socket.on('message', function(message) {
			var data = $.parseJSON(message);
			switch(data.type) {
 				case 'userlist':
					that.userlist.loadUsers(data.userlist);
					break;
				case 'newuser':
					that.userlist.addUser(data.userid, data.user);
					break;
				case 'typing':
					that.userlist.setTyping(data.user.userid, data.user.typing);
					break;
				case 'comment':
					if(!that.infocus) {
						that.blinkTitle();
					}
					that.handlePost(data);
					break;
				case 'removeuser':
					that.userlist.removeUser(data.userid);
					break;
			}
		});
	}
	
	that.send = function (obj) {
		if(typeof obj === 'string') {
			socket.send(obj);
		} else {
			socket.send( JSON.stringify(obj) );
		}
	}
	
	that.onChatSubmit = function() {
		var comment = that.commentInput.val();
		that.commentInput.val('');
		var commentMessage = that.generateMessage('comment', ['comment', 
																'"' + comment + '"', 
																'user', 
																'{"username":"' + that.username + '", "typing":' + that.typing + '}']);
		that.send(commentMessage);
		return false;
	}
	
	that.onUsernameSubmit = function () {
		
		if(that.usernameField.val() != '') {
			that.username = that.usernameField.val();
		}
		
		$('#usernameLabel').html("Welcome, " + that.username);
		$('#login,#overlay').fadeOut();
		
		if(that.roomField.val() != '') {
			that.room = ' ' + that.roomField.val();
		}
		$('#roomlabel').html(that.room);
		
		that.connect();
		
		that.commentInput.focus();
		
		that.commentInput.keyup(function() {
			var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + '", "typing":' + that.typing + '}']);
			
			if(that.commentInput.val() != "") {
				if(!that.typing) {
					that.typing = true;
					var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + 
																			'", "typing":' + that.typing + 
																			',"userid":"' + socket.transport.sessionid + '"}']);
					$('#typing').fadeIn('fast');
					that.send(typingMessage);
				}
			} else {
				if(that.typing) {
					that.typing = false;
					var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + 
																			'", "typing":' + that.typing + 
																			',"userid":"' + socket.transport.sessionid + '"}']);
					$('#typing').fadeOut('fast');
					that.send(typingMessage);
				}
			}
		});
		
		return false;
	}
	
	that.blinkTitle = function() {
		var changeTitle = function() {
			console.log('ads');
			if(document.title.indexOf(':') < 0) {
				document.title = 'Chatter : new message';
			} else {
				document.title = 'Chatter';
			}
		}
		
		blinkInterval = window.setInterval(changeTitle, 500);
	}
	
	that.stopBlinkTitle = function() {
		window.clearInterval(blinkInterval);
		window.setTimeout(function(){document.title = 'Chatter'}, 10);
		console.log(document.title);
	}
};

var chatter = new Chatter();

$(function() {
	chatter.commentInput = $('#comment');
	chatter.usernameField = $('#username');
	chatter.roomField = $('#roomname');
	
	$('#commentForm').submit(chatter.onChatSubmit);
	
	chatter.usernameField.focus();

	$('#usernameForm').submit(chatter.onUsernameSubmit);
	$('#ok').click(chatter.onUsernameSubmit);
	
	chatter.userlist = new UserList( $('#connectedUsers ul') );
	
	win = $(window);
	win.focus(function(){
		chatter.infocus = true;
		chatter.stopBlinkTitle();
		console.log('focus');
	});
	
	win.blur(function(){
		chatter.infocus = false;
				console.log('blur');
	});
});