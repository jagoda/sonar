'use strict';

function JSONParser(body) {
    this.body = body;
}

JSONParser.prototype.parse = function parse(body, callback) {
    if (arguments.length === 1) {
        body = undefined;
        callback = arguments[0];
    }

    this.body = body || this.body;

    try {
        callback(null, JSON.parse(body));
    } catch (e) {
        callback(e);
    }
};

module.exports = JSONParser;
