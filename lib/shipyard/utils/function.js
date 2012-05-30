// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var typeOf = require('./type').typeOf;

exports.noop = function noop() {};

// Allows fn(params) -> fn(key, value) for key, value in params
exports.overloadSetter = function(fn) {
	return function overloadedSetter(keyOrObj, value) {
		var type = typeOf(keyOrObj);
		if (type !== 'string' && type !== 'number') {
			for (var key in keyOrObj) {
				fn.call(this, key, keyOrObj[key]);
			}
		} else {
			fn.call(this, keyOrObj, value);
		}
		return this;
	};
};

// Allows fn(list) -> return fn(key) for key in list
exports.overloadGetter = function(fn) {
	return function overloadedGetter(key) {
		var me = this;
		if (arguments.length > 1) {
			return Array.prototype.map.call(arguments, function(name) {
				return fn.call(me, name);
			});
		} else {
			return fn.call(this, key);
		}
	};
};

// Allows some setup to be called the first. The setup function must
// return a function that will be assigned to same property of the
// object.
exports.lazy = function(obj, key, setup) {
	obj[key] = function() {
		obj[key] = setup.apply(this, arguments);
		obj[key].apply(this, arguments);
	};
};
