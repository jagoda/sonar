var IncomingMessage   = require("http").IncomingMessage,
    PassThroughStream = require("stream").PassThrough,
    inherits          = require("util").inherits;

var METHODS = [ "GET", "POST", "PUT", "DELETE" ],
    GET     = 0;

var DEFAULT_VERSION = "1.1",
    RADIX           = 10,
    ROOT_PATH       = "/";

var Request = module.exports = function (method, url, version) {
    PassThroughStream.call(this);
    IncomingMessage.call(this);
    
    // When only a single argument is provided, it is the request URL.
    if (arguments.length === 1) {
        url    = method;
        method = "GET";
    }
    
    Object.defineProperties(
        this,
        {
            method: {
                configurable : false,
                value        : method || METHODS[GET],
                writable     : false
            },
            url: {
                configurable : false,
                value        : url || ROOT_PATH,
                writable     : false
            },
            httpVersion: {
                configurable : false,
                value        : version || DEFAULT_VERSION,
                writable     : false
            }
        }
    );
    
    if (METHODS.indexOf(this.method) < 0) {
        throw new Error("Invalid request method: '" + this.method + "'.");
    }
    
    var versionParts = this.httpVersion.match(/(\d)\.(\d)/);
    if (versionParts) {
        Object.defineProperties(
            this,
            {
                httpVersionMajor: {
                    configurable : false,
                    value        : parseInt(versionParts[1], RADIX),
                    writable     : false
                },
                httpVersionMinor: {
                    configurable : false,
                    value        : parseInt(versionParts[2], RADIX),
                    writable     : false
                }
            }
        );
    } else {
        throw new Error(
            "Invalid protocol version: '" + this.httpVersion + "'."
        );
    }
    
    this.headers["transfer-encoding"] = "chunked";
};

// Request is a proper subclass of Stream.PassThrough and inherits
// 'parasitically' from IncomingMessage.
inherits(Request, PassThroughStream);
Object.keys(IncomingMessage.prototype).forEach(function (method) {
    if (! Request.prototype[method]) {
        Request.prototype[method] = IncomingMessage.prototype[method];
    }
});
