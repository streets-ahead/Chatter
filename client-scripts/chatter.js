var socket = new io.Socket();

var numPosts = 0;
var username = 'Coward';
var typing = false;

function handlePost(post) {
	numPosts++;

	$('#chats').append('<div class="post" id="post' + numPosts + '" style="display:none">' + 
							'<p class="username">user: ' + post.username + '</p>' +
							'<p class="comment">' + post.comment + '</p>' +
						'</div>');
	$('#post' + numPosts).fadeIn();
	$("#chats").attr({ scrollTop: $("#chats").attr("scrollHeight") });
}

function connect() {
	socket.connect();
	socket.on('message', function(data) {
		var message = jQuery.parseJSON(data);
		if(message.userlist) {
			console.log(message.userlist);
			var htm = '<li class="underlined">connected users:</li>';
			for(var i = 0; i < message.userlist.length; i++) {
				if(message.userlist[i].typing) {
					htm += '<li><img src="pencil-icon.png" />' + message.userlist[i].username + '</li>';
				} else {
					htm += '<li>' + message.userlist[i].username + '</li>';
				}
			}
			
			$('#connectedUsers').html(htm);
		} else {
			handlePost(message);
		}
	});
}

function send(comment) {
	var jsonStr = '{"username":"' + username + '","comment":"' + comment + '", "typing":' + typing + '}'
	socket.send(jsonStr);
}

$(function() {
	var commentInput = $('#comment');
	var usernameField = $('#username');
	
	$('#commentForm').submit(function() {
		var comment = commentInput.val();
		commentInput.val('');
		send(comment);
		return false;
	});
	
	usernameField.focus();
	
	function usernameSubmit() {
		if(usernameField.val() != '') {
			username = usernameField.val();
		}
		
		$('#usernameLabel').html("Welcome, " + username);
		$('#login,#overlay').fadeOut();
		
		connect();
		send("");
		
		commentInput.focus();
		commentInput.keyup(function() {
			if(commentInput.val() != "") {
				if(!typing) {
					typing = true;
					$('#typing').fadeIn('fast');
					send("")
				}
			} else {
				if(typing) {
					typing = false;
					$('#typing').fadeOut('fast');
					send("")
				}
			}
		});
		
		return false;
	}
	
	$('#usernameForm').submit(usernameSubmit);
	$('#ok').click(usernameSubmit);
});