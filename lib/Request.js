var IncomingMessage = require("http").IncomingMessage;

var METHODS = [ "GET", "POST", "PUT", "DELETE" ],
    GET     = 0;

var RADIX             = 10,
    ROOT_PATH         = "/";

var DEFAULT_VERSION   = "1.1";

var Request = module.exports = function (method, url, version) {
    var encoding = null,
        headers = {};
    
    switch (arguments.length) {
    case 1:
        url     = method;
        method  = METHODS[GET];
        version = DEFAULT_VERSION;
        break;
    case 0:
        url     = ROOT_PATH,
        method  = METHODS[GET],
        version = DEFAULT_VERSION;
    }
    
    Object.defineProperties(
        this,
        {
            method: {
                value    : method  || METHODS[GET],
                writable : false
            },
            url: {
                value    : url     || ROOT_PATH,
                writable : false
            },
            headers: {
                get: function () { return headers; }
            },
            httpVersion: {
                value    : version || DEFAULT_VERSION,
                writable : false
            }
        }
    );
    
    if (METHODS.indexOf(this.method) < 0) {
        throw new Error("Invalid request method: '" + this.method + "'.");
    }
    
    var versionParts = this.httpVersion.match(/(\d)\.(\d)/);
    if (versionParts) {
        this.httpVersionMajor = parseInt(versionParts[1], RADIX);
        this.httpVersionMinor = parseInt(versionParts[2], RADIX);
    } else {
        throw new Error("Invalid version string: '" + this.httpVersion + "'.");
    }
    
    this.end = function () {
        this.emit("end");
    };
    
    this.setEncoding = function (newEncoding) {
        encoding = newEncoding;
    };
    
    this.write = function (data) {
        data = Buffer.isBuffer(data) ? data : new Buffer(data);
        
        if (encoding) {
            data = data.toString(encoding);
        }
        this.emit("data", data);
    };
};

Request.prototype = new IncomingMessage();
