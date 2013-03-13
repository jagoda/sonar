{ series } = require "async"
{ expect } = require "chai"
{ IncomingMessage } = require "http"
Request = require "../lib/Request"

describe "A Request", ->

    request = null

    beforeEach ->
        request = new Request

    it "can simulate a trivial request", (done) ->
        request.on "end", done
        
        # Terminate request.
        request.end()
    
    it "simulate data transmition", (done) ->
        buffer = []
        request.on "data", (data) -> buffer.push data
        request.on "end", ->
            (expect buffer).to.deep.equal [ "Hello", "world!" ]
            done()
        
        # Transmit data.
        request.write "Hello"
        request.write "world!"
        request.end()
