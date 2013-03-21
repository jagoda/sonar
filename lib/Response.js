var inherits          = require("util").inherits,
//    OutgoingMessage   = require("http").OutgoingMessage,
    PassThroughStream = require("stream").PassThrough,
    ServerResponse    = require("http").ServerResponse;

var Response = module.exports = function (request) {
    PassThroughStream.call(this);
    ServerResponse.call(this, request);
    
    Object.defineProperties(
        this,
        {
            headers: {
                get: function () {
                    this._headers = this._headers || {};
                    return this._headers;
                }
            }
        }
    );
};

inherits(Response, PassThroughStream);
for (var method in ServerResponse.prototype) {
    if (! Response.prototype[method]) {
        Response.prototype[method] = ServerResponse.prototype[method];
    }
}

Response.prototype.end = function () {
    ServerResponse.prototype.end.apply(this, arguments);
    this.emit("end");
};

Response.prototype.writeHead = function (statusCode, reasonPhrase, headers) {
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
