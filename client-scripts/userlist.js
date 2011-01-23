//depends too heavily on jquery, should probably be a jquery plugin

var UserList = function(userListElement) {
	this.$ule = $(userListElement);
	this.users = new Object();
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