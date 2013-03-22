var mime     = require("connect").utils.mime,
    Request  = require("./Request"),
    Response = require("./Response");

function parse (mime, content) {
    return content;
}

function body (response, callback) {
    var buffer = [];
    
    response.setEncoding("utf-8");
    response.on("data", function (data) {
        buffer.push(data);
    });
    response.on("end", function () {
        response.body = parse(mime(response), buffer.join(""));
        callback();
    });
}

function Sonar (handler, options) {
    options = options || {};
    
    var parseBody = ("parseBody" in options) ? options.parseBody : true;

    function ping (request, response, callback) {
        if (parseBody) {
            body(response, function () {
                // The callback needs to be handled in a different call stack
                // than the stream processing.
                process.nextTick(function () {
                    callback(null, response);
                });
            });
        } else {
            callback(null, response);
        }
        handler(request, response);
        return request;
    }

    this.get = function (url, callback) {
        var request  = new Request(url),
            response = new Response(request);

        return ping(request, response, callback);
    };

}

var sonar = module.exports = function (handler, options) {
    return new Sonar(handler, options);
};

sonar.Request = Request;
sonar.Response = Response;
