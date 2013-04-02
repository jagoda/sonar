var express = require("express");

module.exports = function () {

    var application = express(),
        expressAPI  = express(),
        nested      = express();
    
    function echo (request, response) {
        response.json(request.body);
    }
    
    // Configure top-level API.
    
    application.use(express.bodyParser());
    
    application.get("/json", function (request, response) {
        response.json({ hello: "world" });
    });
    
    application.post("/echo", echo);
    
    // Configure nested API.
    
    nested.post("/echo", echo);
    
    application.use("/nested", nested);
    
    // Configure Express API test.
    
    expressAPI.use("/request/protocol", function (request, response) {
        response.setHeader("Content-Type", "text/plain");
        response.send(request.protocol);
    });
    
    application.use(expressAPI);
    
    return application;

};
