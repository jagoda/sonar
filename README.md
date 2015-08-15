sonar [![Build Status](https://secure.travis-ci.org/mrcrgl/sonar.png)](http://travis-ci.org/mrcrgl/sonar)
=====

Sonar is a test tool for HTTP server instances in NodeJS. Sonar can be used with
most unit test frameworks to test [native HTTP server instances][1],
[Connect][2] instances, and [Express][3] instances -- all without having to
call `listen`.

## Basic Usage

    npm install sonar

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

## Added Perks

When run with [Cover][6], Sonar will add the ability to include coverage reports
of your front-end code right along side your backend code. There's nothing to do
other than invoke your test cases with [Cover][6].

**NOTE:** currently only external script dependencies are instrumented. Inline
scripts will not be covered and will not appear in the coverage report.

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
 + **plugins** - An array of jQuery plugins to use with the response. See
    `sonar.plugin` for more information.

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

### sonar.json

Provides a covenience API for sending JSON payloads. This API is exactly the
same as the normal Sonar API except that it will automatically set the
`Content-Type` header to `application/json` and will add a `send` method to
the returned `Request` object. The send method takes an object to be sent
(this will automatically be stringified). For example:

    var ping = sonar(app).json.post("/path", function (error, response) {
        . . .
    });
    ping.send({ hello: "world" });

### sonar.plugin(implementation)

 + **implementation** - a function defining a custom jQuery plugin. The function
    should expect the global jQuery object as its only argument.

Defines a custom plugin to add to the jQuery API on the response object. This
is a useful way to define custom test helpers. Returns a chainable reference to
the `sonar` instance.

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
[2]: http://www.senchalabs.org/connect/ "Connect"
[3]: http://expressjs.com/ "Express"
[4]: https://github.com/tmpvar/jsdom "jsdom"
[5]: http://nodejs.org/api/http.html#http_http_incomingmessage "IncomingMessage"
[6]: https://github.com/itay/node-cover.git "Cover"
