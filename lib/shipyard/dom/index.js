var Class = require('../class/Class'),
	Node = require('./Node'),
	Window = require('./Window'),
	Document = require('./Document'),
	Element = require('./Element'),
	Elements = require('./Elements'),
	Slick = require('./Slick'),
	Parser = Slick.Parser,
	Finder = Slick.Finder,
	typeOf = require('../utils/type').typeOf,
	env = require('../env');

//<node>
//TODO: some monkey work to require jsdom when testing from node
var window, document;
if (env.browser.jsdom) {
	var jsdom = require('jsdom');
	window = jsdom.html().createWindow();
	document = window.document;
} else {
	window = this.window;
	document = this.document;
}
//</node>

var hostWindow = new Window(window);
var hostDoc = new Document(document);

var overloadNode = function overloadNode() {
	var el = select(arguments[0]);
	if (el) {
		arguments[0] = el.valueOf();
		return this.parent.apply(this, arguments);
	} else {
		return this;
	}
};

var overloadMethods = ['appendChild', 'inject', 'grab', 'replace'];
var DOMElement = new Class({

	Extends: Element,

	Matches: '*', // so that his comes before the origin Element

	initialize: function DOMElement(node, options) {
		var type = typeOf(node);
		if (type == 'string') node = hostDoc.createElement(node).valueOf();
		this.parent(node, options);
	},

	getElements: function getElements(expression) {
		return collect.apply(this, this.parent(expression));
	}
	
});

overloadMethods.forEach(function(methodName) {
	DOMElement.implement(methodName, overloadNode);
});


// $ and $$



function select(node){
	if (node != null){
		if (typeof node == 'string') return hostDoc.find('#'+node);
		if (node.isNode) return node;
		if (node === window) return hostWindow;
		if (node === document) return hostDoc;
		if (node.toElement) return node.toElement();
		return DOMElement.wrap(node);
	}
	return null;
};


var slice = Array.prototype.slice;
function collect(){
	var list = [];
	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i],
			type = typeOf(arg);

		if (type == 'string') list = list.concat(hostDoc.search(arg));
		else if (arg.isNode) list.push(arg);
		else list = list.concat(collect.apply(this, slice.call(arg, 0)));
	}
	return new Elements(list);
};

if (!document.body) throw new Error("document.body doesn't exist yet.");
hostDoc.body = new DOMElement(document.body);
//hostDoc.head = new DOMElement(document.getElementsByTagName('head')[0]);


exports.window = hostWindow;
exports.document = hostDoc;
exports.Element = DOMElement;
exports.Elements = Elements;
exports.$ = exports.select = select;
exports.$$ = exports.collect = collect;
