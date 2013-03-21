var IncomingMessage = require("http").IncomingMessage,
    DuplexStream    = require("stream").Duplex,
    inherits        = require("util").inherits;

var METHODS = [ "GET", "POST", "PUT", "DELETE" ],
    GET     = 0;

var DEFAULT_VERSION = "1.1",
    RADIX           = 10,
    ROOT_PATH       = "/";

var Request = module.exports = function (method, url, version) {
    DuplexStream.call(this);
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
};

// Request is a proper subclass of Stream.Duplex and inherits 'parasitically'
// from IncomingMessage.
inherits(Request, DuplexStream);
for (var key in IncomingMessage.prototype) {
    Request.prototype[key] = IncomingMessage.prototype[key];
}

// This is trivial since calls to 'write' push data directly.
Request.prototype._read = function () {
    this.push(null);
};

Request.prototype._write = function (chunk, encoding, callback) {
    this.push(chunk);
    callback();
};
