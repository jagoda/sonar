'use strict';

var getBodyParser = require('./body-parser').getBodyParser;

var copyObject = require('copy-object'),
    Request   = require('./http/request'),
    Response  = require('./http/response');

/**
 *
 * @param options
 * @constructor
 */
function Maja(options) {
    this.opts = {
        method: 'GET',
        uri: '/',
        json: false,
        parseBody: true,
        headers: {}
    };

    this._patchJSONHook();
    this.applyOptions(options);
    this.checkRequest();
}

Maja.prototype._patchJSONHook = function patchJSONHook() {
    Object.defineProperty(this, 'json', {
        get: function () {
            this.opts.json = true;
            return this;
        }
    });
};

/**
 *
 * @param options
 */
Maja.prototype.applyOptions = function applyOptions(options) {
    options.uri = options.uri || options.url;
    delete options.url;

    copyObject(options, this.opts, ['app', 'uri', 'headers', 'method', 'body', 'json', 'parseBody']);
};

/**
 *
 * @returns {boolean}
 */
Maja.prototype.checkRequest = function checkRequest() {
    return true;
};

/**
 *
 * @param callback
 */
Maja.prototype.request = function startRequest(callback) {
    this._startRequest(callback);
};

/**
 *
 * @param callback
 * @returns {*}
 */
Maja.prototype._startRequest = function startRequest(callback) {
    var headers = this.opts.headers,
        request  = new Request(this.opts.method, this.opts.uri),
        response = new Response(request);

    request = this._preRequest(request);

    request = this._emitRequest(request, response, callback);

    request = this._postRequest(request);

    return request;
};

Maja.prototype._preRequest = function preRequest(request) {
    var headers = this.opts.headers;

    Object.keys(headers).forEach(function (key) {
        request.setHeader(key, headers[key]);
    });

    if (this.opts.json) {
        this.opts.body = ('object' === typeof this.opts.body) ? JSON.stringify(this.opts.body) : this.opts.body;
        request.setHeader('Content-Type', 'application/json');
    }

    return request;
};

Maja.prototype._postRequest = function postRequest(request) {

    request.end(this.opts.body);

    return request;
};

/**
 *
 * @param request
 * @param response
 * @param callback
 * @returns {*}
 */
Maja.prototype._emitRequest = function emitRequest(request, response, callback) {
    var app = this.opts.app;

    if (this.opts.parseBody) {
        this._listenToResponse(response, function (err, res, body) {
            // The callback is ideally handled in a different call stack
            // than the stream processing.
            process.nextTick(function () {
                callback(err, res, body);
            });
        });
    } else {
        // When the callback is responsible for parsing the body, it needs
        // to be executed immediately.
        // TODO: Don't get this code?!
        callback(null, response);
    }
    app(request, response);

    return request;
};

/**
 *
 * @param response
 * @param callback
 */
Maja.prototype._listenToResponse = function listenToResponse(response, callback) {
    var buffer = [];

    // TODO this may vary
    response.setEncoding('utf-8');
    response.on('data', function (data) {
        buffer.push(data);
    });
    response.on('end', function () {
        var c = response.headers['content-type'];
        var mime = c ? c.match(/^[a-z]+\/[a-z]+[^;]/)[0] : null;

        this._parseResponseBody(
            mime,
            buffer.join(''),
            function (err, content) {
                if (err) {
                    return callback(err);
                }

                return callback(null, response, content);
            });
    }.bind(this));
};

/**
 *
 * @param mime
 * @param body
 * @param callback
 */
Maja.prototype._parseResponseBody = function parseResponseBody(mime, body, callback) {
    try {
        getBodyParser(mime).parse(body, callback);
    } catch (e) {
        if (e.code === 'ENOTIMPLEMENTED') {
            callback(null, body);
            return;
        }

        callback(e);
    }
};

module.exports = Maja;
