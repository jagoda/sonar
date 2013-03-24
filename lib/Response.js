var inherits          = require("util").inherits,
    PassThroughStream = require("stream").PassThrough,
    ServerResponse    = require("http").ServerResponse;

var Response = module.exports = function (request) {
    // FIXME: Express plays nasty tricks with object prototypes so we need to
    // (re-)define API attributes locally to keey Express from breaking
    // things...
    for (var key in PassThroughStream.prototype) {
        this[key] = PassThroughStream.prototype[key];
    }
    
    // Seem to need this or else 'end' won't be emitted.
    this.end = function () {
        ServerResponse.prototype.end.apply(this, arguments);
        this.emit("end");
    };

    // This is needed to update the 'headers' property accordingly.
    this.writeHead = function (statusCode, reasonPhrase, headers) {
        var self = this;
        
        if (arguments.length === 2) {
            headers = reasonPhrase;
        }
        
        if (headers) {
            Object.keys(headers).forEach(function (key) {
                self.setHeader(key, headers[key]);
            });
        }
        ServerResponse.prototype.writeHead.call(this, statusCode, reasonPhrase);
    };
    
    PassThroughStream.call(this);
    ServerResponse.call(this, request);
    
    this._headers = {};
    
    Object.defineProperties(
        this,
        {
            headers: {
                get: function () {
                    this._headers = this._headers;
                    return this._headers;
                }
            }
        }
    );
};

// Request is a proper subclass of Stream.PassThrough and inherits
// 'parasitically' from ServerResponse.
inherits(Response, PassThroughStream);
for (var method in ServerResponse.prototype) {
    if (! Response.prototype[method]) {
        Response.prototype[method] = ServerResponse.prototype[method];
    }
}
