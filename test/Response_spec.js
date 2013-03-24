var captureData            = require("./streams").captureData,
    connect                = require("connect"),
    expect                 = require("chai").expect,
    express                = require("express"),
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
    
    describe("is compatible with Connect and", function () {
    
        var app, env, request, response;
        
        beforeEach(function () {
            app      = connect(),
            request  = new Request(),
            response = new Response(request);
        });
    
        it("can render a response message", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(400);
                expect(data).to.deep.equal([ "hello" ]);
                done();
            }
                
            app.use(function (request, response) {
                response.statusCode = 400;
                response.end("hello");
            });
            
            response.setEncoding("utf-8");
            captureData(response, checkData);
            app(request, response);
        });
        
        it("can set headers", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.headers).to.have.property("foo", "bar");
                done();
            }
            
            app.use(function (request, response) {
                response.setHeader("foo", "bar");
                response.end();
            });
            
            captureData(response, checkData);
            app(request, response);
        });
        
        it("will report 'expected' errors", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(String(data)).to.contain("Error: oops!");
                done();
            }
            
            app.use(function (request, response, next) {
                next(new Error("oops!"));
            });
            
            captureData(response, checkData);
            response.setEncoding("utf-8");
            app(request, response);
        });
        
        it("will report uncaught errors", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(String(data)).to.contain("Error: oops!");
                done();
            }
            
            app.use(function (request, response, next) {
                throw new Error("oops!");
            });
            
            captureData(response, checkData);
            response.setEncoding("utf-8");
            app(request, response);
        });
    
    });
    
    describe("is compatible with Express and", function () {
    
        var app, env, request, response;
        
        beforeEach(function () {
            app      = express(),
            request  = new Request(),
            response = new Response(request);
        });
    
        it("can render a response message", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(400);
                expect(data).to.deep.equal([ "hello" ]);
                done();
            }
                
            app.get("/", function (request, response) {
                response.send(400, "hello");
            });
            
            response.setEncoding("utf-8");
            captureData(response, checkData);
            app(request, response);
        });
        
        it("can set headers", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.headers).to.have.property("foo", "bar");
                done();
            }
            
            app.get("/", function (request, response) {
                response.set("foo", "bar");
                response.end();
            });
            
            captureData(response, checkData);
            app(request, response);
        });
        
        it("will report 'expected' errors", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(String(data)).to.contain("Error: oops!");
                done();
            }
            
            app.get("/", function (request, response, next) {
                next(new Error("oops!"));
            });
            
            captureData(response, checkData);
            response.setEncoding("utf-8");
            app(request, response);
        });
        
        it("will report uncaught errors", function (done) {
            function checkData (error, data) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(String(data)).to.contain("Error: oops!");
                done();
            }
            
            app.get("/", function (request, response, next) {
                throw new Error("oops!");
            });
            
            captureData(response, checkData);
            response.setEncoding("utf-8");
            app(request, response);
        });
    
    });

});
