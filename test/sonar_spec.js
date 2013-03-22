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

});
