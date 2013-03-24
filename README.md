sonar
=====

Sonar is a test tool for HTTP server instances in NodeJS. Sonar can be used with
most unit test frameworks to test [native HTTP server instances][1],
[Connect][2] instances, and [Express][3] instances -- all without having to
call `listen`.

## Basic Usage

Sonar works by wrapping a handler or application instance and exposing a simple
HTTP API for generating sythentic request/response objects. By default, Sonar
will capture all resulting response data and place it in the `body` attribute
of the response. HTML responses are parsed using [jsdom][4] with "jQueryify"
support for DOM navigation. For example, a simple test of the page title might
look like:

    sonar(app).get("/page", function (error, response) {
        var title = response.body.$('title').text();
        
        expect(title).to.equal("Page Title");
    });

Similarly, Sonar will automatically parse JSON responses to objects and will
gather all other responses into the `body` attribute as text.

## Usage Details

### sonar(application, [options])

 + **application** - the application/handler to simulate requests to.
 + **options** - _Optional_. Configuration options for the wrapper.

Creates a new `sonar` instance by wrapping an application or handler. The
following options are available:

 + **parseBody** - _Defaults to true_. When `true`, Sonar will buffer and
    attempt to parse the response contents based on the response content type.
    If set to `false`, the request callback is responsible for calling
    `response.on("data", . . .)` and `response.on("end", . . .)` itself.

### sonar.get(path, [headers], callback)
### sonar.post(path, [headers], callback)
### sonar.put(path, [headers], callback)
### sonar.delete(path, [headers], callback)

 + **path** - the path to simulate a request to.
 + **headers** - _Optional_. A hash of headers to add to the request.
 + **callback** - called when the request has been processed. The callback is
    passed two arguments, `(error, response)`.

Simulates a request to the handler. Returns a request object similar to
[http.IncomingMessage][5].

## For the Slightly More Adventurous

`Request` and `Response` objects can be constructed and passed to handler
instances directly if desired. For example:

    var request  = new Request("/path"),
        response = new Response(request);
    
    response.setEncoding("utf-8");
    response.on("data", function (data) { console.log(data); });
    app(request, response);
    
### sonar.Request([method], [path], [httpVersion])

 + **method** - _Defaults to "GET"_. The HTTP request method.
 + **path** - _Defaults to "/"_. The path to request.
 + **httpVersion** - _Defaults to "1.1"_. The HTTP protocol version.

### sonar.Response(request)

 + **request** - The request to be responded to.

[1]: http://nodejs.org/api/http.html#http_http_createserver_requestlistener "HTTP Server"
[2]: https://github.com/senchalabs/connect "Connect"
[3]: http://expressjs.com/ "Express"
[4]: https://github.com/tmpvar/jsdom "jsdom"
[5]: http://nodejs.org/api/http.html#http_http_incomingmessage "IncomingMessage"
