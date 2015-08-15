
var fs        = require("fs"),
    jsdom     = require("jsdom"),
    Request   = require("./Request"),
    Response  = require("./Response");

var jQueryContent = fs.readFileSync(__dirname + "/../assets/jquery.js",
    "utf-8");

function send (object) {
    this.end(JSON.stringify(object));
}

function Sonar (handler, options) {
    options = options || {};
    
    var jsonEnabled = false,
        parseBody   = ("parseBody" in options) ? options.parseBody : true,
        plugins     = Array.isArray(options.plugins) ?
                        options.plugins.slice() :
                        [];

    function parse (mime, content, callback) {
        try {
            switch(mime) {
            case "application/json":
                callback(null, JSON.parse(content));
                break;
            case "text/html":
                jsdom.env({
                    html: content,
                    src: [jQueryContent],
                    done: callback
                });
                break;
            default:
                callback(null, content);
                break;
            }
        } catch (error) {
            return callback(error);
        }
    }

    function body (response, callback) {
        var buffer = [];

        response.setEncoding("utf-8");
        response.on("data", function (data) {
            buffer.push(data);
        });
        response.on("end", function () {
            var c = response.headers['content-type'];
            var mime = c ? c.match(/^[a-z]+\/[a-z]+[^;]/)[0] : null;

            parse(
                mime,
                buffer.join(""),
                function (error, content) {
                if (error) {
                    return callback(error);
                }
                
                response.body = content;
                return callback(null);
            });
        });
    }

    function createRequest (method, url, headers, callback) {
        var request  = new Request(method, url),
            response = new Response(request);

        Object.keys(headers).forEach(function (key) {
            request.setHeader(key, headers[key]);
        });
        
        if (jsonEnabled) {
            request.send = send;
            request.setHeader("Content-Type", "application/json");
        }

        return ping(request, response, callback);
    }

    function ping (request, response, callback) {
        if (parseBody) {
            body(response, function (error) {
                // The callback is ideally handled in a different call stack
                // than the stream processing.
                process.nextTick(function () {
                    // Initialize jQuery plugins.
                    if (response.body && response.body.$) {
                        plugins.forEach(function (implementation) {
                            implementation(response.body.$);
                        });
                    }
                    callback(error, response);
                });
            });
        } else {
            // When the callback is responsible for parsing the body, it needs
            // to be executed immediately.
            callback(null, response);
        }
        handler(request, response);
        return request;
    }
    
    // Using array notation to avoid JSHint error from reserved word.
    this["delete"] = function (url, headers, callback) {
        if (arguments.length === 2) {
            callback = headers;
            headers = {};
        }
        
        return createRequest("DELETE", url, headers, callback);
    };
    
    this.get = function (url, headers, callback) {
        if (arguments.length === 2) {
            callback = headers;
            headers = {};
        }
        
        return createRequest("GET", url, headers, callback);
    };
    
    this.plugin = function (implementation) {
        plugins.push(implementation);
        return this;
    };
    
    this.post = function (url, headers, callback) {
        if (arguments.length === 2) {
            callback = headers;
            headers = {};
        }
        
        return createRequest("POST", url, headers, callback);
    };
    
    this.put = function (url, headers, callback) {
        if (arguments.length === 2) {
            callback = headers;
            headers = {};
        }
        
        return createRequest("PUT", url, headers, callback);
    };
    
    Object.defineProperty(this, "json", {
        get: function () {
            jsonEnabled = true;
            return this;
        }
    });
}

var sonar = module.exports = function (handler, options) {
    return new Sonar(handler, options);
};

sonar.Request  = Request;
sonar.Response = Response;
