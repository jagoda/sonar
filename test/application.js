var connect = require("connect");

module.exports = function () {
    var application = connect();
    
    application.use("/plain-text", function (request, response) {
        response.setHeader("Content-Type", "text/plain");
        response.end("This is some plain text.");
    });
    
    return application;
};
