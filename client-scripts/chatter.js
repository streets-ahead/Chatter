var socket = new io.Socket('10.0.0.33');

var numPosts = 0;
var username = 'Coward';

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
				htm += '<li>' + message.userlist[i] + '</li>';
			}
			
			$('#connectedUsers').html(htm);
		} else {
			handlePost(message);
		}
	});
}

function send(comment) {
	var jsonStr = '{"username":"' + username + '","comment":"' + comment + '"}'
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
		commentInput.focus();
		
		connect();
		send("");
		
		return false;
	}
	
	$('#usernameForm').submit(usernameSubmit);
	$('#ok').click(usernameSubmit);
});