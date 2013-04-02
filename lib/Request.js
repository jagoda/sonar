var IncomingMessage   = require("http").IncomingMessage,
    PassThroughStream = require("stream").PassThrough,
    inherits          = require("util").inherits;

var METHODS = [ "GET", "POST", "PUT", "DELETE" ],
    GET     = 0;

var DEFAULT_VERSION = "1.1",
    RADIX           = 10,
    ROOT_PATH       = "/";

var Request = module.exports = function (method, url, version) {
    // FIXME: Express plays nasty tricks with object prototypes so we need to
    // (re-)define API attributes locally to keey Express from breaking
    // things...
    for (var key in PassThroughStream.prototype) {
        this[key] = PassThroughStream.prototype[key];
    }
    
    this.setHeader = function (name, value) {
        name = name.toLowerCase();
        
        var old = this.headers[name];
        this.headers[name] = value;
        
        return old;
    };

    PassThroughStream.call(this);
    IncomingMessage.call(this);
    
    // When only a single argument is provided, it is the request URL.
    if (arguments.length === 1) {
        url    = method;
        method = "GET";
    }
    
    this.method      = method  || METHODS[GET];
    this.url         = url     || ROOT_PATH;
    this.httpVersion = version || DEFAULT_VERSION;
    
    if (METHODS.indexOf(this.method) < 0) {
        throw new Error("Invalid request method: '" + this.method + "'.");
    }
    
    var versionParts = this.httpVersion.match(/(\d)\.(\d)/);
    if (versionParts) {
        this.httpVersionMajor = parseInt(versionParts[1], RADIX);
        this.httpVersionMinor = parseInt(versionParts[2], RADIX);
    } else {
        throw new Error(
            "Invalid protocol version: '" + this.httpVersion + "'."
        );
    }
    
    this.connection = {
        encrypted: false
    };
    this.setHeader("Transfer-Encoding", "chunked");
};

// Request is a proper subclass of Stream.PassThrough and inherits
// 'parasitically' from IncomingMessage.
inherits(Request, PassThroughStream);
Object.keys(IncomingMessage.prototype).forEach(function (method) {
    if (! Request.prototype[method]) {
        Request.prototype[method] = IncomingMessage.prototype[method];
    }
});
