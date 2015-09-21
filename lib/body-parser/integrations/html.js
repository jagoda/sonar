'use strict';

var fs = require('fs'),
    jsdom = require('jsdom'),
    jQueryContent = fs.readFileSync(__dirname + '/../../../assets/jquery.js', 'utf-8');

function HTMLParser(body) {
    this.body = body;
}

HTMLParser.prototype.parse = function parse(body, callback) {
    if (arguments.length === 1) {
        body = undefined;
        callback = arguments[0];
    }

    this.body = body || this.body;

    jsdom.env({
        html: this.body,
        src: [jQueryContent],
        features: {
            FetchExternalResources: ['script'],
            ProcessExternalResources: ['script'],
            MutationEvents: '2.0'
        },
        done: function (err, window) {
            callback(err, window);
        }
    });
};

module.exports = HTMLParser;
