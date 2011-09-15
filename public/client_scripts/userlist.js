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

//depends too heavily on jquery, should probably be a jquery plugin

var UserList = function(userListElement) {
	this.$ule = $(userListElement);
	this.users = {};
}

UserList.prototype.loadUsers = function (userlist) {
	this.users = userlist;
	
	for(userid in this.users) {
		var style = this.users[userid].typing ? 'style="visibility:visible"' : '';
		this.$ule.append('<li id="' + userid + '"><img width="16" height="16"  src="pencil.png" ' + style + ' /> ' + 
							this.users[userid].username + 
						' </li>');
	}
}

UserList.prototype.removeUser = function (userid) {
	$('#' + userid).remove();
	delete this.users[userid];
}

UserList.prototype.setTyping = function (userid, typing) {
	if(typing) {
		$('#uid' + userid + ' img').css('visibility', 'visible');

	} else {
		$('#uid' + userid + ' img').css('visibility', 'hidden');
	}
	
}

UserList.prototype.addUser = function (userid, userObj) {
	this.users[userid] = userObj;
	var style = this.users[userid].typing ? 'style="visibility:visible"' : '';
	this.$ule.append('<li id="' + userid + '"><img width="16" height="16" src="pencil.png" ' + style + '/> ' + this.users[userid].username + ' </li>');
}

UserList.prototype.clearUsers = function () {
	this.users = new Object();
	this.$ule.html('');
}