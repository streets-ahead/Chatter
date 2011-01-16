// when deployed to the server need to change to var socket = new io.Socket('chatterapp.info', {"port":8080});
var socket = new io.Socket();

var chatter = function() {
	this.numPosts = 0;
	this.username = 'Coward';
	this.typing = false;
	
	//not very safe
	this.generateMessage = function(type, fields) {
		var jsonstr = '{"type":"' + type + '",';
		for(var i = 0; i < fields.length; i+=2) {
			jsonstr += '"' + fields[i] + '":';
			jsonstr += fields[i+1] + (i+2 < fields.length ? ',': '');
		}
		jsonstr += '}';
		
		return jsonstr;
	}
	
	this.handlePost = function (post) {
		this.numPosts++;

		$('#chats').append('<div class="post" id="post' + this.numPosts + '" style="display:none">' + 
								'<p class="username">user: ' + post.user.username + '</p>' +
								'<p class="comment">' + post.comment + '</p>' +
							'</div>');
		$('#post' + numPosts).fadeIn();
		$("#chats").attr({ scrollTop: $("#chats").attr("scrollHeight") });
	}
	
	this.connect = function () {
		socket.connect();
		var newUserMessage = this.generateMessage('newuser', ['user', '{"username":"' + this.username + '", "typing":' + this.typing + '}']);
		this.send( newUserMessage );

		socket.on('message', function(data) {
			var message = jQuery.parseJSON(data);
			
			switch(message.type) {
 				case 'userlist':
					this.userlist.loadUsers(message.userlist);
					break;
				case 'newuser':
					this.userlist.addUser(message.userid, message.user);
					break;
				case 'typing':
					this.userlist.setTyping(message.userid, message.user.typing);
					break;
				case 'comment':
					this.handlePost(message);
					break;
			}
		});
	}
	
	this.send = function (obj) {
		if(typeof obj === 'string') {
			socket.send(obj);
		} else {
			socket.send( JSON.stringify(obj) );
		}
	}
	
	this.onChatSubmit = function() {
		var comment = this.commentInput.val();
		this.commentInput.val('');
		var commentMessage = this.generateMessage('comment', ['comment', 
																comment, 
																'user', 
																'{"username":"' + this.username + '", "typing":' + this.typing + '}']);
		send(commentMessage);
		return false;
	}
	
	this.onUsernameSubmit = function () {
		if(this.usernameField.val() != '') {
			this.username = this.usernameField.val();
		}
		
		$('#usernameLabel').html("Welcome, " + this.username);
		$('#login,#overlay').fadeOut();
		
		this.connect();
		
		this.commentInput.focus();
		this.commentInput.keyup(function() {
			var typingMessage = this.generateMessage('typing', ['user', '{"username":"' + this.username + '", "typing":' + this.typing + '}']);
			
			if(this.commentInput.val() != "") {
				if(!this.typing) {
					this.typing = true;
					var typingMessage = this.generateMessage('typing', ['user', '{"username":"' + this.username + '", "typing":' + this.typing + '}']);
					$('#typing').fadeIn('fast');
					this.send(typingMessage);
				}
			} else {
				if(this.typing) {
					this.typing = false;
					var typingMessage = this.generateMessage('typing', ['user', '{"username":"' + this.username + '", "typing":' + this.typing + '}']);
					$('#typing').fadeOut('fast');
					this.send(typingMessage);
				}
			}
		});
		
		return false;
	}
}

$(function() {
	chatter.commentInput = $('#comment');
	chatter.usernameField = $('#username');
	
	$('#commentForm').submit(chatter.onChatSubmit);
	
	chatter.usernameField.focus();

	$('#usernameForm').submit(chatter.onUsernameSubmit);
	$('#ok').click(onUsernameSubmit);
	
	chatter.userlist = new UserList( $('#connectedUsers ul') );
});