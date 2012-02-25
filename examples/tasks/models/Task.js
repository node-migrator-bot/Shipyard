var Class = require('shipyard/class/Class'),
	model = require('shipyard/model'),
	Syncable = require('shipyard/sync/Syncable'),
	BrowserSync = require('shipyard/sync/Browser');

var Task = module.exports = new Class({
	
	Extends: model.Model,

	Implements: Syncable,

	Sync: {
		'default': {
			table: 'tasks',
			driver: BrowserSync
		}
	},
	
	fields: {
		id: model.fields.TextField(),
		title: model.fields.TextField(),
		createdAt: model.fields.DateField(),
		isDone: model.fields.BooleanField({ 'default': false })
	},

	toString: function() {
		return this.get('title');
	}
	
});
