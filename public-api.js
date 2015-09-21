'use strict';

var Maja = require('./lib/maja');

/**
 *
 * @param app
 * @returns {appRequest}
 */
function maja(app) {

    /**
     *
     * @param uri
     * @param options
     * @param callback
     * @returns {Maja}
     */
    function appRequest(uri, options, callback) {
        var params = initParams(uri, options, callback);
        params.app = app;

        var m = new Maja(params);

        setImmediate(function () {
            m.request(params.callback);
        });

        return m;
    }

    appRequest.get = addVerb('GET', appRequest);
    appRequest.head = addVerb('HEAD', appRequest);
    appRequest.post = addVerb('POST', appRequest);
    appRequest.put = addVerb('PUT', appRequest);
    appRequest.delete = addVerb('DELETE', appRequest);

    return appRequest;
}

/**
 *
 * initParams('/foo', {}, fn);
 * initParams('/foo', {});
 * initParams('/foo', fn);
 * initParams({}, fn);
 * initParams({});
 *
 * @param [uri]
 * @param params
 * @param [fn]
 * @returns {*}
 */
function initParams(uri, params, fn) {
    if (undefined === fn) {
        if ('string' === typeof arguments[0]) {
            params = {};
            params.uri = arguments[0];
        } else {
            params = arguments[0];
        }
        params.callback = fn = arguments[1];
    } else {
        params.uri = uri;
        if (fn) {
            params.callback = fn;
        }
    }

    if (!params.method) {
        params.method = 'GET';
    }

    return params;
}

function addVerb(verb, appRequest) {
    return function (uri, options, fn) {
        var params = initParams(uri, options, fn);

        params.method = verb.toUpperCase();
        appRequest.call(this, params, params.callback);
    };
}

module.exports = maja;
