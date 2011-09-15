var lazybum = require('lazyBum'),
	Controller = lazybum.get('Controller');
	
var log = lazybum.getLogger(module);

var Index = Controller.extend(function() {
	Index.super_.apply(this, arguments);
});

Index.prototype.helpers = ['html'];

module.exports = Index;

Index.prototype.index_get = function(urlParts, query) {
	this.writeResponse( { frameworkName : 'lazyBum' } );
};


