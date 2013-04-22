var expect  = require("chai").expect,
    express = require("express"),
    path    = require("path"),
    sonar   = require("../");

describe("The resource loader patch", function () {

    var app   = express(),
        SONAR = sonar(app);
    
    app.use("/static", express.static(path.join(__dirname, "data")));
    
    app.get("/script", function (request, response) {
        response.send("<html><body><script type='text/javascript' src='/static/global.script'></script></body></html>");
    });

    it("can load external resources served by a sonar instance", function (done) {
        SONAR.get("/script", function (error, response) {
            expect(error).to.not.exist;
            expect(response.body).to.have.property("message", "hello");
            done();
        });
    });
    
    it("can 'require' script inclusions", function (done) {
        var included  = false,
            requireJS = require.extensions[".js"];
        
        require.extensions[".js"] = function (module, filename) {
            // Web marker is for the sake of the coverage report.
            expect(filename).to.equal("web-ui/static/global.script");
            included = true;
        };
        SONAR.get("/script", function (error, response) {
            try {
                expect(error).to.not.exist;
                expect(included).to.be.true;
            } finally {
                require.extensions[".js"] = requireJS;
            }
            done();
        });
    });

});
