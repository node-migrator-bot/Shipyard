var Class = require('../class/Class'),
    dom = require('../dom');

var EVENTS = [
    'click',
    'mousedown',
    'mouseup',
    'keydown',
    'keypress',
    'keyup',
    'focus',
    'blur',
    'submit',
    'mouseenter',
    'mouseleave'
];


module.exports = new Class({

    root: null,

    selector: '.shipyard-view',

    _views: {},

    initialize: function ViewMediator(root) {
        this.root = dom.$(root) || dom.document.body;
        this.delegate();
    },

    delegate: function delegate() {
        EVENTS.forEach(function(evt) {
            this.root.delegate(this.selector, evt, this._handleEvent(evt));
        }, this);
    },

    registerView: function registerView(view) {
        this._views[view.get('id')] = view;
    },

    _handleEvent: function(evt) {
        var mediator = this;
        return function viewEvent(ev, element) {
            // View bubbling, stopped with stopPropagation()
            var bubble = true;
            var oldStop = ev.stopPropagation;
            ev.stopPropagation = function() {
                bubble = false;
                oldStop.call(ev);
            };
            var view = mediator._views[element.get('id')];
            while (bubble && view) {
                view.emit(evt, ev);
                view = view.get('parentView');
            }
        };
    }

});