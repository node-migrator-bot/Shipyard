// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('../class/Class'),
    Events = require('../class/Events'),
    Store = require('../class/Store'),
    typeOf = require('../utils/type').typeOf,
    object = require('../utils/object'),
    assert = require('../error/assert'),
    DOMEvent = require('./Event'),
    Slick = require('./Slick'),
    Finder = Slick.Finder;

var wrappers = {}, matchers = [];

// Event Listeners

function addEventListener(type, fn, useCapture) {
    this.node.addEventListener(type, fn, !!useCapture);
    return this;
}

function attachEvent(type, fn) {
    this.node.attachEvent('on' + type, fn);
    return this;
}

function removeEventListener(type, fn) {
    this.node.removeEventListener(type, fn, false);
    return this;
}

function detachEvent(type, fn) {
    this.node.detachEvent('on' + type, fn);
    return this;
}

function relay(e){
    var related = e.relatedTarget;
    if (related == null) {
        return true;
    }
    if (!related) {
        return false;
    }
    return (related !== this.getNode() && related.prefix !== 'xul' && !this.contains(related));
}

var CustomEvents = {
    mouseenter: {
        base: 'mouseover',
        condition: relay
    },
    mouseleave: {
        base: 'mouseout',
        condition: relay
    },
	focus: {
		base: 'focus',
		capture: true
	},
	blur: {
		base: 'blur',
		capture: true
	}
};

function wrapHandler(node, type, fn) {
    var realType = type,
        condition = fn,
        orig = fn.listener || fn;
    var events = node.__wrappedEvents || (node.__wrappedEvents = {
        wraps: [],
        origs: []
    });

    var wrapped = events.wraps[events.origs.indexOf(orig)];
    if (!wrapped) {
        var custom = CustomEvents[type];
        if (custom) {
            if (custom.condition) {
                condition = function(e) {
                    if (custom.condition.call(node, e, type)) {
                        return fn.apply(node, arguments);
                    }
                    return true;
                };
            }
            if (custom.base) {
                realType = custom.base;
            }
        }
        wrapped = function(e) {
            if (e) {
                e = new DOMEvent(e, node.getWindow());
            }
            condition.apply(node, arguments);
        };
        wrapped.listener = orig;
        events.origs.push(orig);
        events.wraps.push(wrapped);
    }

    return wrapped;
}

function unwrapHandler(node, type, fn) {
    var events = node.__wrappedEvents || (node.__wrappedEvents = {
        wraps: [],
        origs: []
    });

    var orig = fn.listener || fn;

    var index = events.origs.indexOf(orig);
    var wrapped = events.wraps[index];
    if (wrapped) {
        delete events.wraps[index];
        delete events.origs[index];
        return wrapped;
    }
}

var _addEvent = function() {
    _addEvent = this.node.addEventListener ?
        addEventListener :
        attachEvent;

    _addEvent.apply(this, arguments);
};

var _removeEvent = function() {
    _removeEvent = this.node.removeEventListener ?
        removeEventListener :
        detachEvent;

    _removeEvent.apply(this, arguments);
};

var EventsProtoRemove = Events.prototype.removeListener;
var EventsProtoAdd = Events.prototype.addListener;

var Node = new Class({

    Implements: [Events, Store],

    isNode: true,

    initialize: function Node(node) {
        this.node = node;
        wrappers[Finder.uidOf(node)] = this;
    },
    
    find: function find(expression) {
        return Node.wrap(Finder.find(this.node, expression || '*'));
    },

    getElement: function getElement(expression) {
        return this.find(expression);
    },
    
    search: function search(expression) {
        var nodes = Finder.search(this.node, expression || '*');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i] = Node.wrap(nodes[i]);
        }
        return nodes;
    },

    getElements: function getElements(expression) {
        return this.search(expression);
    },

    getNode: function getNode() {
        return this.node;
    },

    getWindow: function() {
        return Node.wrap(this.node.ownerDocument).getWindow();
    },

    addListener: function addListener(name, fn) {
		var options = CustomEvents[name] || {};
        fn = wrapHandler(this, name, fn);
        _addEvent.call(this, options.base || name, fn, options.capture);
        return EventsProtoAdd.call(this, name, fn);
    },

    removeListener: function removeListener(name, fn) {
        fn = unwrapHandler(this, name, fn);
        _removeEvent.call(this, name, fn);
        return EventsProtoRemove.call(this, name, fn);
    },

    delegate: function delegate(selector, name, fn) {
        var delegation = function(e, target) {
            target = target || (e && e.target);
            var node = this.getNode();
			if (target && target.isNode) {
				target = target.getNode();
			}

            while (target && target !== node) {
                if (Finder.match(target, selector)) {
                    target = Node.wrap(target);
                    return fn.call(target, e, target);
                } else {
                    target = target.parentNode;
                }
            }
        };
		// Not doing this fixes Issue #25.
        //delegation.listener = fn;

        return this.addListener(name, delegation);
    }

});

Node.prototype.valueOf = function(){
    return this.node;
};



Node.defineMutator('Matches', function(match){
    matchers.push({_match: match, _class: this});
});

Node.wrap = function(node) {
    if (node == null) {
        return null;
    }
    if (node.isNode) {
        return node;
    }
	var type = typeOf(node);
	if (type === 'boolean' || type === 'number') {
		return null;
	}
    assert('nodeName' in node, 'Node.wrap requires a DOM node:', node);
    var uid = Finder.uidOf(node), wrapper = wrappers[uid];
    if (wrapper) {
        return wrapper;
    }
    for (var l = matchers.length; l--; l){
        var current = matchers[l];
        if (Finder.match(node, current._match)) {
            return (new current._class(node));
        }
    }

};

module.exports = Node;
