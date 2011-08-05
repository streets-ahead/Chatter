/*
 * Copyright (C) 2011 by Streets Ahead LLC
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 */

// when deployed to the server need to change to var socket = new io.Socket('chatterapp.info', {"port":8080});
var socket;

if (window.location.host == "chatterapp.info"){
	socket = new io.connect('http://chatterapp.info:8080');//io.Socket('chatterapp.info', {"port":8080})
}else {
	console.log('setting default socket address')
	socket = new io.Socket();
}

//could probably refactor to ues prototypes, however I like being able to have "private" vars and metohds
var Chatter = function() {
	var that = this;
	var numPosts = 0;
	var typing = false;
	var room = 'Disco Cafe';
	var blinkInterval;
		
	that.username = 'Coward';
	that.infocus = true;

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
	
	var addZero = function(num) {
		return num < 10 ? '0' + num : num;
	}
	
	that.handlePost = function (post) {
		numPosts++;
		var today = new Date();
		var time = addZero(today.getHours()) + ":" + addZero(today.getMinutes()) + ":" + addZero(today.getSeconds());
		$('#chats').append('<div class="post" id="post' + numPosts + '" style="display:none">' + 
								'<p class="username">user: ' + post.user.username + '<span style="float:right">' + time + '</span></p>' +
								'<p class="comment">' + post.comment + '</p>' +
							'</div>');
		$('#post' + numPosts).fadeIn();
		$("#chats").attr({ scrollTop: $("#chats").attr("scrollHeight") });
	}
	
	that.loadNewImage = function(path) {
		var imageBox = $('#imagebox');
		var spinner = imageBox.find('#spinner');
		var img = new Image();
		var $img = $(img);
		$img.load(function () {
			$img.css('padding', '10px');
			$img.hide();
			$img.width(230);
			$img.height(230);
			spinner.removeClass('spinner');
			var old = spinner.find('img');
			old.fadeOut();
			old.remove();
			spinner.append(img);
			$img.fadeIn();
		}).attr('src', path);
	}
	
	that.connect = function () {
		socket.connect();
		var newUserMessage = that.generateMessage('newuser', ['user', '{"username":"' + that.username + '", "typing":' + typing + '}', 
																'room', '"' + room + '"']);
		//console.log(newUserMessage);
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
				case 'newimage':
					that.loadNewImage(data.url);
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
																'{"username":"' + that.username + '", "typing":' + typing + '}']);
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
			room = that.roomField.val();
		}
		$('#roomlabel').html(room);
		that.initShare();
		that.connect();
		
		that.commentInput.focus();
		
		that.commentInput.keyup(function() {
			var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + '", "typing":' + typing + '}']);
			
			if(that.commentInput.val() != "") {
				if(!typing) {
					typing = true;
					var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + 
																			'", "typing":' + typing + 
																			',"userid":"' + socket.transport.sessionid + '"}']);
					$('#status').fadeIn('fast');
					that.send(typingMessage);
				}
			} else {
				if(typing) {
					typing = false;
					var typingMessage = that.generateMessage('typing', ['user', '{"username":"' + that.username + 
																			'", "typing":' + typing + 
																			',"userid":"' + socket.transport.sessionid + '"}']);
					$('#status').fadeOut('fast');
					that.send(typingMessage);
				}
			}
		});
		
		return false;
	}
	
	that.blinkTitle = function() {
		var changeTitle = function() {
			//console.log('ads');
			if(document.title.indexOf(':') < 0) {
				document.title = 'Chatter : new message';
			} else {
				document.title = 'Chatter';
			}
		}
		
		if(blinkInterval == null) {
			blinkInterval = window.setInterval(changeTitle, 500);
		}
	}
	
	that.stopBlinkTitle = function() {
		var changeItBack = function () {
			document.title = 'Chatter';
		}
		window.clearInterval(blinkInterval);
		blinkInterval = null;
		window.setTimeout(changeItBack, 1);
	}
	
	that.initShare = function() {
		var uploaddialog = $('#uploadformdialog');
		$('#imagebox a').click(function() {
			$('#overlay').fadeIn();
			uploaddialog.fadeIn();
			return false;
		});
		
		$('#share').click(function() {
			$('#uploadForm').submit();
			that.fadeOutUpload();
		});
		
		$('#cancel').click(function() {
			that.fadeOutUpload();
		});
		
		$('#uploadForm').ajaxForm({
			"data":{"room":room},
			"iframe":true,
			"resetForm":true
		});
	}
	
	that.fadeOutUpload = function() {
		$('#overlay,#uploadformdialog').fadeOut();
		that.commentInput.focus();
	}
};

var chatter = new Chatter();

$(function() {
	chatter.commentInput = $('#comment');
	chatter.usernameField = $('#username');
	chatter.roomField = $('#roomname');
	
	$('.formback').formDefault();
	
	$('#commentForm').submit(chatter.onChatSubmit);
	
	chatter.usernameField.focus();

	$('#usernameForm').submit(chatter.onUsernameSubmit);
	$('#ok').click(chatter.onUsernameSubmit);
	
	chatter.userlist = new UserList( $('#connectedUsers ul') );
	
	win = $(window);
	win.focus(function(){
		chatter.infocus = true;
		chatter.stopBlinkTitle();
		//console.log('focus');
	});
	
	win.blur(function(){
		chatter.infocus = false;
				//console.log('blur');
	});
});