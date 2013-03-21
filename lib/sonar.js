var Request  = require("./Request"),
    Response = require("./Response");

function Sonar (handler) {

    function ping (request, response, callback) {
        response.on("end", function () {
            // The callback needs to be handled in a different call stack than
            // the stream processing.
            process.nextTick(function () {
                callback(response);
            });
        });
        handler(request, response);
        return request;
    }

    this.get = function (url, callback) {
        var request  = new Request(url),
            response = new Response(request);

        return ping(request, response, callback);
    };

}

var sonar = module.exports = function (handler) {
    return new Sonar(handler);
};

sonar.Request = Request;
sonar.Response = Response;
