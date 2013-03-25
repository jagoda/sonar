var captureData = require("./streams").captureData,
    connect = require("connect");

module.exports = function () {
    var application = connect();
    
    application.use("/echo", function (request, response) {
        function respond (error, data) {
            delete request.headers["transfer-encoding"];
            response.setHeader("Content-Type", "application/json");
            response.end(
                JSON.stringify({
                    method  : request.method,
                    headers : request.headers,
                    content : data.join("")
                })
            );
        }
        
        captureData(request, respond);
    });
    
    application.use("/error", function (request, response) {
        response.setHeader("Content-Type", "application/json");
        response.end("{ \"hello\": world }");
    });
    
    application.use("/html", function (request, response) {
        response.setHeader("Content-Type", "text/html");
        response.write("<html>");
        response.write("<body>");
        response.write("Hello");
        response.write("</body>");
        response.write("</html>");
        response.end();
    });
    
    application.use("/json", function (request, response) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ hello: "world" }));
    });
    
    application.use("/plain-text", function (request, response) {
        response.setHeader("Content-Type", "text/plain");
        response.end("This is some plain text.");
    });
    
    return application;
};
