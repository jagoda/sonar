var expect  = require("chai").expect,
    express = require("express"),
    jsdom   = require("jsdom"),
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
            expect(filename).to.equal("*front-end* /static/global.script");
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
    
    it("will detect script load errors", function (done) {
        var get = SONAR.get;
        
        SONAR.get = function (path, callback) {
            if (path === "/static/global.script") {
                return callback(new Error("Simulated failure."));
            }
            
            return get.apply(this, arguments);
        };
        
        SONAR.get("/script", function (error, response) {
            try {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
            } finally {
                SONAR.get = get;
            }
            done();
        });
    });
    
    it("it maintains the original file loading behavior", function (done) {
        var script = "file://" + path.join(__dirname, "data", "global.script"),
            code, document, window;
        
        code     = "<html><body><script type='text/javascript' src='" + script +
            "'></script></body></html>"
        document = jsdom.jsdom(
            code,
            null,
            {
                features : {
                    FetchExternalResources   : [ "script" ],
                    ProcessExternalResources : [ "script" ]
                }
            }
        );
        
        window = document.createWindow();
        window.onload = function () {
            expect(this).to.have.property("message", "hello");
            done();
        };
    });
    
    it("maintains the ability to skip external resources", function (done) {
        var script = "file://" + path.join(__dirname, "data", "global.script"),
            loaded = true,
            code, document, window;
        
        code     = "<html><body><script type='text/javascript' src='" + script +
            "'></script></body></html>"
        document = jsdom.jsdom(
            code,
            null,
            {
                features : {
                    FetchExternalResources : [ "script" ],
                    SkipExternalResources  : [ script ]
                }
            }
        );
        
        window = document.createWindow();
        loaded = jsdom.dom.level3.html.resourceLoader.load(
            document.body.firstChild,
            script
        );
        expect(loaded).to.be.false;
        done();
    });
    
});
