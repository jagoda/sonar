var connect                = require("connect"),
    expect                 = require("chai").expect,
    EventEmitter           = require("events").EventEmitter,
    IncomingMessage        = require("http").IncomingMessage,
    itIsAPassThroughStream = require("./streams").itIsAPassThroughStream,
    Request                = require("../").Request,
    Response               = require("../").Response;

describe("A Request", function () {

    it("will GET the root URL by default", function () {
        function checkRequest (request) {
            expect(request).to.have.property("method", "GET");
            expect(request).to.have.property("url", "/");
            expect(request).to.have.property("httpVersion", "1.1");
            expect(request).to.have.property("httpVersionMajor", 1);
            expect(request).to.have.property("httpVersionMinor", 1);
        }
        
        checkRequest(new Request());
        checkRequest(new Request(null));
        checkRequest(new Request(null, null));
        checkRequest(new Request(null, null, null));
    });
    
    it("will use the GET method by default", function () {
        function checkRequest (request) {
            expect(request).to.have.property("method", "GET");
            expect(request).to.have.property("url", "/path");
            expect(request).to.have.property("httpVersion", "1.1");
            expect(request).to.have.property("httpVersionMajor", 1);
            expect(request).to.have.property("httpVersionMinor", 1);
        }
        
        checkRequest(new Request("/path"));
        checkRequest(new Request(null, "/path"));
        checkRequest(new Request(null, "/path", null));
    });
    
    it("can use a custom request method", function () {
        function checkRequest (request) {
            expect(request).to.have.property("method", "POST");
            expect(request).to.have.property("url", "/path");
            expect(request).to.have.property("httpVersion", "1.1");
            expect(request).to.have.property("httpVersionMajor", 1);
            expect(request).to.have.property("httpVersionMinor", 1);
        }
        
        checkRequest(new Request("POST", "/path"));
        checkRequest(new Request("POST", "/path", null));
    });
    
    it("must use a valid request method", function () {
        expect(new Request("GET"   , "/")).to.have.property("method", "GET");
        expect(new Request("POST"  , "/")).to.have.property("method", "POST");
        expect(new Request("PUT"   , "/")).to.have.property("method", "PUT");
        expect(new Request("DELETE", "/")).to.have.property("method", "DELETE");
        
        function usingABadMethod () {
            return new Request("BAD", "/");
        }
        
        expect(usingABadMethod).to.throw(/Invalid request method/);
    });
    
    it("can use a custom protocol version", function () {
        function checkRequest (request) {
            expect(request).to.have.property("httpVersion", "0.9");
            expect(request).to.have.property("httpVersionMajor", 0);
            expect(request).to.have.property("httpVersionMinor", 9);
        }
        
        checkRequest(new Request("GET", "/", "0.9"));
    });
    
    it("must use a vaild protocol version", function () {
        var request = new Request("GET", "/", "1.0");
        
        expect(request).to.have.property("httpVersion", "1.0");
        
        function usingABadVersion () {
            return new Request("GET", "/", "0");
        }
        
        expect(usingABadVersion).to.throw(/Invalid protocol version/);
    });
    
    it("has a read-only method property", function () {
        var request = new Request("GET", "/", "1.0");
        
        function checkRequest (request) {
            expect(request).to.have.property("method", "GET");
        }
        
        checkRequest(request);
        request.method = "POST";
        checkRequest(request);
    });
    
    it("has a read-only URL property", function () {
        var request = new Request("GET", "/", "1.0");
        
        function checkRequest (request) {
            expect(request).to.have.property("url", "/");
        }
        
        checkRequest(request);
        request.url = "/path";
        checkRequest(request);
    });
    
    it("has a read-only version property", function () {
        var request = new Request("GET", "/", "1.0");
        
        function checkRequest (request) {
            expect(request).to.have.property("httpVersion", "1.0");
            expect(request).to.have.property("httpVersionMajor", 1);
            expect(request).to.have.property("httpVersionMinor", 0);
        }
        
        checkRequest(request);
        request.httpVersion = "1.1";
        checkRequest(request);
    });
    
    it("can specify request headers", function () {
        var request = new Request();
        
        expect(request).to.have.property("headers");
        expect(request.headers).to.not.have.property("FOO");
        
        request.headers.FOO = "bar";
        expect(request.headers).to.have.property("FOO", "bar");
    });
    
    it("uses the 'chunked' transfer encoding by default", function () {
        var request = new Request();
        
        expect(request.headers).to.have.property(
            "transfer-encoding",
            "chunked"
        );
    });
    
    itIsAPassThroughStream(function () {
        return new Request();
    });
    
    describe("is compatible with Connect and", function () {

        it("can be routed to a handler", function (done) {
            var app      = connect(),
                request  = new Request("/path"),
                response = new Response(request);
                
            app.use("/path", function (request, response) {
                done();
            });
            app(request, response);
        });
        
        it("can send a JSON payload", function (done) {
            var app      = connect(),
                request  = new Request(),
                response = new Response(request);
                
            app.use(connect.middleware.json());
            app.use(function (request, response) {
                expect(request.body).to.deep.equal(
                    {
                        hello: "world"
                    }
                );
                done();
            });
            
            request.headers["content-type"] = "application/json";
            app(request, response);
            request.end("{ \"hello\": \"world\" }");
        });

    });

});
