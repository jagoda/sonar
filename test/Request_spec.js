var expect          = require("chai").expect,
    EventEmitter    = require("events").EventEmitter,
    IncomingMessage = require("http").IncomingMessage,
    Request         = require("../").Request;

describe("A Request", function () {

    it("is an IncomingMessage", function () {
        var request = new Request();
        
        expect(request).to.be.an.instanceof(IncomingMessage);
        expect(request).to.be.an.instanceof(EventEmitter);
    });
    
    it("will GET the root URL by default", function () {
        var request = new Request();
        
        expect(request).to.have.property("method", "GET");
        expect(request).to.have.property("url", "/");
        expect(request).to.have.property("httpVersion", "1.1");
        expect(request).to.have.property("httpVersionMajor", 1);
        expect(request).to.have.property("httpVersionMinor", 1);
    });
    
    it("will GET a URL by default", function () {
        var request = new Request("/path");
        
        expect(request).to.have.property("method", "GET");
        expect(request).to.have.property("url", "/path");
        expect(request).to.have.property("httpVersion", "1.1");
        expect(request).to.have.property("httpVersionMajor", 1);
        expect(request).to.have.property("httpVersionMinor", 1);
    });

});
