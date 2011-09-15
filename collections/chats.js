var lazybum = require('lazybum'),
	Collection = lazybum.get('Collection');
	
var log = lazybum.getLogger(module);

var chats = Collection.extend(function() {
	chats.super_.apply(this, ['chats', {
		//fill in schema here
	}]);
});

module.exports = chats;
