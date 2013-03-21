var expect  = require("chai").expect,
    streams = module.exports;

function captureData (stream, callback) {
    var buffer = [];
    
    function endStream () {
        if (buffer) {
            var data = buffer;
            
            buffer = null;
            // Processing of the captured data should occur in a different call
            // stack than the stream processing.
            process.nextTick(function () {
                callback(null, data); }
            );
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

streams.captureData = captureData;

streams.itIsAPassThroughStream = function (createStream) {
    
    var stream;
    
    beforeEach(function () {
        stream = createStream();
    });
    
    it("can transmit a payload", function (done) {
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
        
        captureData(stream, checkData);
        stream.write("hello");
        stream.write(new Buffer("world"));
        stream.end();
    });
    
    it("can specify a 'receiving' encoding", function (done) {
        var ENCODING = "utf-8";
        
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done()
        }
        
        stream.setEncoding(ENCODING);
        captureData(stream, checkData);
        stream.write(new Buffer("hello", ENCODING));
        stream.end();
    });
    
    it("can specify a 'sending' encoding", function (done) {
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        stream.setEncoding("utf-8");
        captureData(stream, checkData);
        stream.write("68656c6c6f", "hex");
        stream.end();
    });
    
    it("can terminate with a message", function (done) {
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        stream.setEncoding("utf-8");
        captureData(stream, checkData);
        stream.end("hello");
    });
    
    it("can specify a 'sending' encoding when terminating", function (done) {
        function checkData (error, data) {
            expect(error).to.be.null;
            expect(data).to.deep.equal([ "hello" ]);
            done();
        }
        
        stream.setEncoding("utf-8");
        captureData(stream, checkData);
        stream.end("68656c6c6f", "hex");
    });
    
};
