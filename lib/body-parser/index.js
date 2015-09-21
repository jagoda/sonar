'use strict';

var HTMLParser = require('./integrations/html'),
    JSONParser = require('./integrations/json');

/**
 *
 * @param mimeType
 * @returns {HTMLParser|JSONParser}
 */
function getBodyParser(mimeType) {
    switch (mimeType) {
        case 'text/html':
            return new HTMLParser();

        case 'application/json':
            return new JSONParser();

        default:
            var e = new Error('Not Implemented: ' + mimeType);
            e.code = 'ENOTIMPLEMENTED';
            throw e;
    }
}

module.exports.getBodyParser = getBodyParser;
