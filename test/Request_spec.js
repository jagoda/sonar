var expect          = require("chai").expect,
    EventEmitter    = require("events").EventEmitter,
    IncomingMessage = require("http").IncomingMessage,
    Request         = require("../").Request;

describe("A Request", function () {

    function captureData (stream, callback) {
        var buffer = [];
        
        function endStream () {
            if (buffer) {
                var data = buffer;
                
                buffer = null;
                callback(null, data);
            }
        }
        
        function updateBuffer (data) {
            if (buffer && typeof data !== "undefined") {
                buffer.push(data);
            }
        }
        
        stream.on("data", updateBuffer);
        stream.on("end", endStream);
    }

    xit("is an IncomingMessage", function () {
        var request = new Request();
        
        expect(request).to.be.an.instanceof(IncomingMessage);
        expect(request).to.be.an.instanceof(EventEmitter);
    });
    
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
    
    it("will GET a URL by default", function () {
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
    
    it("has a read-only method", function () {
        var request = new Request("GET", "/", "1.0");
        
        function checkRequest (request) {
            expect(request).to.have.property("method", "GET");
        }
        
        checkRequest(request);
        request.method = "POST";
        checkRequest(request);
    });
    
    it("has a read-only URL", function () {
        var request = new Request("GET", "/", "1.0");
        
        function checkRequest (request) {
            expect(request).to.have.property("url", "/");
        }
        
        checkRequest(request);
        request.url = "/path";
        checkRequest(request);
    });
    
    it("has a read-only version", function () {
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
        expect(request.headers).to.deep.equal({});
        
        request.headers.FOO = "bar";
        expect(request.headers).to.deep.equal({ FOO: "bar" });
    });
    
    it("can transmit a payload", function (done) {
        var request = new Request();
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.be.an.instanceof(Array);
            expect(data).to.deep.equal(
                [
                    new Buffer("hello"),
                    new Buffer("world")
                ]
            );
            done();
        }
        
        captureData(request, checkData);
        request.write("hello");
        request.write(new Buffer("world"));
        request.end();
    });
    
    xit("cannot write data after calling 'end'", function () {
        var request = new Request();
        
        function callingWrite () {
            request.write("foo");
        }
        
        request.end();
        expect(callingWrite).to.throw(/request has already ended/);
    });
    
    xit("cannot call end twice", function () {
        var request = new Request();
        
        function callingEndTwice () {
            request.end();
            request.end();
        }
        
        expect(callingEndTwice).to.throw(/request has already ended/);
    });
    
    it("can specify a 'receiving' encoding", function (done) {
        var ENCODING = "utf-8",
            request = new Request();
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done()
        }
        
        request.setEncoding(ENCODING);
        captureData(request, checkData);
        request.write(new Buffer("hello", ENCODING));
        request.end();
    });
    
    it("can specify a 'sending' encoding", function (done) {
        var request = new Request();
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        request.setEncoding("utf-8");
        captureData(request, checkData);
        request.write("68656c6c6f", "hex");
        request.end();
    });
    
    it("can terminate with a message", function (done) {
        var request = new Request();
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        request.setEncoding("utf-8");
        captureData(request, checkData);
        request.end("hello");
    });
    
    it("can specify a 'sending' encoding when terminating", function (done) {
        var request = new Request();
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        request.setEncoding("utf-8");
        captureData(request, checkData);
        request.end("68656c6c6f", "hex");
    });

});
