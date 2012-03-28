var Request = require('../http/Request'),
    typeOf = require('../utils/type').typeOf,
    string = require('../utils/string'),
    Spy = require('./Spy');

var oldXHR = new Request().xhr.constructor;

var xhrStack = [];

function fifoXHR(method, url, async) {
    var xhr = xhrStack.shift() || oldXHR;
    return new xhr(method, url, async);
}
fifoXHR.DONE = 4;

Request.setXHR(fifoXHR);

module.exports = function mockXHR(response, status) {
    var handler;
    if (typeOf(response) === 'function') {
        handler = response;
        response = '';
    }
    if (typeOf(response) !== 'string') {
        response = JSON.stringify(response);
    }

    function XHR() {}
    XHR.prototype = {
        open: new Spy(),
        send: function(data) {
            if (handler) {
                var response = handler.call(this, data);
                if (typeOf(response) !== 'string') {
                    response = JSON.stringify(response);
                }
                this.responseText = response;
            }
            this.onreadystatechange();
        },
        abort: new Spy(),
        readyState: 4,
        status: status || 200,
        responseText: response,
        setRequestHeader: new Spy()
    };
    XHR.DONE=4;

    xhrStack.push(XHR);
};
