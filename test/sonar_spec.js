var application = require("./application"),
    captureData = require("./streams").captureData,
    expect      = require("chai").expect,
    sonar       = require("../");

describe("A Sonar instance", function () {

    var app = application();

    it("can capture a response body", function (done) {
        sonar(app).get("/plain-text", function (error, response) {
            expect(error).to.be.null;
            expect(response).to.have.property(
                "body",
                "This is some plain text."
            );
            done();
        });
    });
    
    it("can parse a JSON response body", function (done) {
        sonar(app).get("/json", function (error, response) {
            expect(error).to.be.null;
            expect(response.body).to.deep.equal({
                hello: "world"
            });
            done();
        });
    });
    
    it("can parse an HTML response body", function (done) {
        sonar(app).get("/html", function (error, response) {
            expect(error).to.be.null;
            expect(response.body.$("body").text()).to.equal("Hello");
            done();
        });
    });
    
    it("will report errors parsing a response payload", function (done) {
        sonar(app).get("/error", function (error, response) {
            expect(error).to.be.an.instanceof(Error);
            expect(error).to.have.property("name", "SyntaxError");
            done();
        });
    });
    
    it("can be configured to allow manual response parsing", function (done) {
        function checkBody (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "This is some plain text." ]);
            done();
        }
    
        sonar(app, { parseBody: false })
            .get("/plain-text", function (error, response) {
                expect(error).to.be.null;
                expect(response).to.not.have.property("body");
                response.setEncoding("utf-8");
                captureData(response, checkBody);
            });
    });
    
    it("can perform a GET request with headers", function (done) {
        var ping = sonar(app)
            .get("/echo", { foo: "bar" }, function (error, response) {
                expect(error).to.be.null;
                expect(response.body).to.deep.equal({
                    method  : "GET",
                    headers : { foo: "bar" },
                    content : "hello"
                });
                done();
            });
        
        ping.end("hello");
    });
    
    it("can perform a POST request", function (done) {
        var ping = sonar(app).post("/echo", function (error, response) {
            expect(error).to.be.null;
            expect(response.body).to.deep.equal({
                method  : "POST",
                headers : {},
                content : "hello"
            });
            done();
        });
        
        ping.end("hello");
    });
    
    it("can perform a POST request with headers", function (done) {
        var ping = sonar(app)
            .post("/echo", { foo: "bar" }, function (error, response) {
                expect(error).to.be.null;
                expect(response.body).to.deep.equal({
                    method  : "POST",
                    headers : { foo: "bar" },
                    content : "hello"
                });
                done();
            });
        
        ping.end("hello");
    });
    
    it("can perform a PUT request", function (done) {
        var ping = sonar(app).put("/echo", function (error, response) {
            expect(error).to.be.null;
            expect(response.body).to.deep.equal({
                method  : "PUT",
                headers : {},
                content : "hello"
            });
            done();
        });
        
        ping.end("hello");
    });
    
    it("can perform a PUT request with headers", function (done) {
        var ping = sonar(app)
            .put("/echo", { foo: "bar" }, function (error, response) {
                expect(error).to.be.null;
                expect(response.body).to.deep.equal({
                    method  : "PUT",
                    headers : { foo: "bar" },
                    content : "hello"
                });
                done();
            });
        
        ping.end("hello");
    });
    
    it("can perform a DELETE request", function (done) {
        var ping = sonar(app).delete("/echo", function (error, response) {
            expect(error).to.be.null;
            expect(response.body).to.deep.equal({
                method  : "DELETE",
                headers : {},
                content : "hello"
            });
            done();
        });
        
        ping.end("hello");
    });
    
    it("can perform a DELETE request with headers", function (done) {
        var ping = sonar(app)
            .delete("/echo", { foo: "bar" }, function (error, response) {
                expect(error).to.be.null;
                expect(response.body).to.deep.equal({
                    method  : "DELETE",
                    headers : { foo: "bar" },
                    content : "hello"
                });
                done();
            });
        
        ping.end("hello");
    });

});
