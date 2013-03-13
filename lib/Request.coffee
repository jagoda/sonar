{ Stream } = require "stream"

class Request extends Stream
    constructor: ->
    
    end: (data) -> @emit "end", data
    
    write: (data) -> @emit "data", data
    
module.exports = Request
