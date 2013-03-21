var application = require("./application"),
    expect      = require("chai").expect,
    sonar       = require("../");

describe("A Sonar instance", function () {

    var app = application();

    it("can retrieve plain text content", function (done) {
        sonar(app).get("/plain-text", function (response) {
            expect(response).to.have.property(
                "body",
                "This is some plain text."
            );
            done();
        });
    });

});
