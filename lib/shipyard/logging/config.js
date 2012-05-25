var logging = require('./index');
var Formatter = require('./Formatter');
var array = require('../utils/array');

function configureFormatter(formatter, options) {
	var FormatterClass = formatter['class'] || Formatter;
	return new FormatterClass(formatter.format, formatter.datefmt);
}

function configureHandler(handler, options) {
	var HandlerClass = handler['class'];
	var hndlr = new HandlerClass(handler.level);
	if (handler.formatter) {
		hndlr.setFormatter(options.formatters[handler.formatter]);
	}
	return hndlr;
}

function configureLogger(name, loggerOptions, options) {
	var logger = logging.getLogger(name);
	if (loggerOptions.level != null) {
		logger.setLevel(loggerOptions.level);
	}
	
	array.from(loggerOptions.handlers).forEach(function eachHandler(hName) {
		logger.addHandler(options.handlers[hName]);
	});

	if (loggerOptions.propagate != null) {
		logger.propagate = loggerOptions.propagate;
	}
}

module.exports = function config(options) {
	// lets do formatters first, since they dont depend on anything
	// then handlers, since they can depend on formatters
	// and then loggers, since they can depend on handlers

	var formatters = options.formatters || {};
	for (var f in formatters) {
		formatters[f] = configureFormatter(formatters[f], options);
	}

	var handlers = options.handlers || {};
	for (var h in handlers) {
		handlers[h] = configureHandler(handlers[h], options);
	}

	var loggers = options.loggers || {};
	for (var l in loggers) {
		configureLogger(l, loggers[l], options);
	}
};
