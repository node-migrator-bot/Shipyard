var Class = require('./Class'),
    Observable = require('./Observable'),
    object = require('../utils/object'),
    assert = require('../error/assert');

module.exports = new Class({

    _handlers: [],

    isDestroyed: false,

    initialize: function Binding(obs1, obs2, map) {
        // Make sure we have some Observables
        // TODO: This might be a bad idea. What if someone Implements
        // Observable instead of Extending it?
        var msg = 'Cannot bind to non-Observable: ';
        assert(obs1 instanceof Observable, msg, obs1);
        assert(obs2 instanceof Observable, msg, obs2);

        var observeDeep = false;

        object.forEach(map, function(to2, from1) {
            this._handlers.push(obs2.observe(to2, function(val) {
                obs1.set(from1, val);
            }, observeDeep));

            this._handlers.push(obs1.observe(from1, function(val) {
                obs2.set(to2, val);
            }, observeDeep));
        }, this);

    },

    destroy: function destroy() {
        this._handlers.forEach(function(h) {
            h.detach();
        });
        this._handlers = [];
        this.isDestroyed = true;
    }

});
