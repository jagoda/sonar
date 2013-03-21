var expect                 = require("chai").expect,
    itIsAPassThroughStream = require("./streams").itIsAPassThroughStream,
    Response               = require("../").Response,
    Request                = require("../").Request;

describe("A Response", function () {

    function createResponse () {
        return new Response(new Request());
    }

    it("has a '200' default status code", function () {
        var response = createResponse();
        
        expect(response).to.have.property("statusCode", 200);
    });
    
    it("can manipulate header values", function () {
        var response = createResponse();
        
        var NAME  = "foo",
            VALUE = "bar";
        
        expect(response.headers).to.deep.equal({});
        expect(response.getHeader(NAME)).to.be.undefined;
        
        response.setHeader(NAME, VALUE);
        expect(response.headers).to.have.property(NAME, VALUE);
        expect(response.getHeader(NAME)).to.equal(VALUE);
        
        response.removeHeader(NAME);
        expect(response.headers).to.not.have.property(NAME);
        expect(response.getHeader(NAME)).to.be.undefined;
    });
    
    it("can write response header with a status code", function () {
        var response = createResponse();
        
        response.writeHead(400);
        expect(response).to.have.property("statusCode", 400);
    });
    
    it("can write a response header with header values", function () {
        var response = createResponse();
        
        response.writeHead(500, { foo: "bar" });
        expect(response).to.have.property("statusCode", 500);
        expect(response.headers).to.have.property("foo", "bar");
    });
    
    itIsAPassThroughStream(function () {
        return createResponse();
    });

});
