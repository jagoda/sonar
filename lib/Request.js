var IncomingMessage = require("http").IncomingMessage;

var METHOD_GET = "GET";

var RADIX             = 10,
    ROOT_PATH         = "/";

var DEFAULT_VERSION   = [ "1", "1" ],
    VERSION_MAJOR     = 0,
    VERSION_MINOR     = 1,
    VERSION_SEPARATOR = ".";

var Request = module.exports = function (method, url, version) {
    switch (arguments.length) {
    case 1:
        url     = method;
        method  = METHOD_GET;
        version = DEFAULT_VERSION.join(VERSION_SEPARATOR);
        break;
    default:
        url     = ROOT_PATH,
        method  = METHOD_GET,
        version = DEFAULT_VERSION.join(VERSION_SEPARATOR);
    }
    
    this.method      = method  || METHOD_GET;
    this.url         = url     || ROOT_PATH;
    this.httpVersion = version || DEFAULT_VERSION.join(VERSION_SEPARATOR);
    
    var versionParts = version ?
        version.split(VERSION_SEPARATOR) :
        DEFAULT_VERSION;
    this.httpVersionMajor = parseInt(
        versionParts[VERSION_MAJOR] || DEFAULT_VERSION[VERSION_MAJOR],
        RADIX
    );
    this.httpVersionMinor = parseInt(
        versionParts[VERSION_MINOR] || DEFAULT_VERSION[VERSION_MINOR],
        RADIX
    );
};

Request.prototype = new IncomingMessage();
