var Class = require('../class/Class'),
	Syncable = require('../sync/Syncable'),
	ShipyardError = require('../error/Error'),
	overloadSetter = require('../utils/function').overloadSetter,
	assert = require('../error/assert'),
	object = require('../utils/object'),
	logging = require('../logging');

var UNDEF;
var log = logging.getLogger('shipyard.model.Model');

var Model = module.exports = new Class({
	
	Extends: Syncable,
	
	//default to always having an ID field?
	//fields: {},

	pk: 'id',

	initialize: function Model(data) {
		// make sure the 'pk' field exists, otherwise Model doesn't work
		assert(this.pk in this.constructor.__fields,
			"Model doesn\'t have the pk field '" + this.pk +"'");
		this.parent(data);
		for (var f in this.constructor.__fields) {
			var field = this.constructor.__fields[f];
			if (!field.isField) {
				continue;
			}


			var def = field.getOption('default');
			if (def != null && this.get(f) === UNDEF) {
				this.set(f, def);
			}
		}
	},
	
	_set: function _set(key, value) {
		var field = this.constructor.__fields[key];
		if (field && field.isField) {
			value = field.from(value);
		}
		
		this.parent(key, value);
	},
	
	_get: function _get(key) {
		if (!(key in this.constructor.__fields) && !(key in this)) {
			log.warn('Getting unknown key "{0}" from model.', key);
		}
		return this.parent(key);
	},

	toJSON: function toJSON() {
		var data = {};
		var fields = this.constructor.__fields;
		for (var key in fields) {
			var field = fields[key];
			if (field.isField && field.getOption('write')) {
				var val = this.get(key);
				if (val !== undefined) {
					data[key] = field.serialize(this.get(key));
				}
			}
		}
		return data;
	},

	toString: function toString() {
		// you should override this, since some Views will cast the
		// Model to a string when rendering
		return '[object Model]';
	}

});

Model.__fields = {};

Model.defineMutator('fields', function mutator_fields(fields) {
	object.forEach(fields, function(field, name) {
		this.__fields[name] = field;
	}, this);
});
