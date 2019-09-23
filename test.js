var promisesAplusTests = require('promises-aplus-tests');
// delete global.Promise - slow
global.Promise = undefined;
require('./polyfill');

var adapter = {
	resolved: Promise.resolve,
	rejected: Promise.reject,
	deferred: function() {
		var object = {};
		object.promise = new Promise(function(resolve, reject) {
			object.resolve = resolve;
			object.reject = reject;
		});

		return object;
	}
};
promisesAplusTests(adapter, function(err) {
	console.log(err);
});
