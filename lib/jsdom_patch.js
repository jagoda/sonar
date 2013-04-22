var fs    = require("fs"),
    jsdom = require("jsdom"),
    path  = require("path"),
    URL   = require("url");

var JQUERY = fs.readFileSync(
        path.join(__dirname, "jquery.js"),
        { encoding: "utf-8" }
    );

function jQueryify (window) {
    if (!window || !window.document) { return; }

    var args = Array.prototype.slice.call(arguments),
        callback = (typeof(args[args.length - 1]) === "function") && args.pop(),
        path,
        jQueryTag = window.document.createElement("script");
        
    jQueryTag.className = "jsdom";

    if (args.length > 1 && typeof(args[1] === "string")) {
        path = args[1];
    }

    var features = window.document.implementation._features;
    window.document.implementation.addFeature("MutationEvents", ["2.0"]);
    window.document.implementation.addFeature(
        "FetchExternalResources",
        ["script"]
    );
    window.document.implementation.addFeature(
        "ProcessExternalResources",
        ["script"]
    );
    if (path) {
        jQueryTag.src = path;
    } else {
        jQueryTag.text = JQUERY;
    }
    jQueryTag.onload = function() {
        if (callback) {
            callback(window, window.jQuery);
        }

        window.document.implementation._features = features;
    };
    window.document.body.appendChild(jQueryTag);

    return window;
}
jQueryify._patched = true;

if (! jsdom.jQueryify._patched) {
    jsdom.jQueryify = jsdom.jsdom.jQueryify = jQueryify;
}

function processScript (path, content) {
    var load         = require.extensions[".js"],
        proxy        = Object.create(module),
        readFileSync = fs.readFileSync;
    
    proxy._compile = function (code) {
        if (code.indexOf("// Instrumentation Header") >= 0) {
            var parts = code.split("// Instrumented Code");
            
            if (parts.length === 2) {
                // Only want to hijack 'require' in the instrumentation header.
                parts[0] = parts[0].replace(/require/g, "document.nodeRequire");
                content = parts.join("");
            }
        }
    };
    
    fs.readFileSync = function () { return content; };
    try {
        // Mark files as coming from the UI.
        load(proxy, "*front-end* " + path);
    } finally {
        fs.readFileSync = readFileSync;
    }
    
    return content;
}

function load (element, href, callback) {
    var ownerImplementation = element._ownerDocument.implementation,
        sonar               = element._ownerDocument.sonar;

    // Hack to allow browser scripts to include node modules (needed for
    // coverage of included scripts).
    element._ownerDocument.nodeRequire = function (path) {
        return module.require(path);
    };

    if (
        ownerImplementation.hasFeature(
            "FetchExternalResources",
            element.tagName.toLowerCase()
        )
    ) {
        var full = this.resolve(element._ownerDocument, href);
        var url = URL.parse(full);

        if (ownerImplementation.hasFeature("SkipExternalResources", full)) {
            return false;
        }
        if (url.hostname) {
            this.download(
                url,
                this.baseUrl(element._ownerDocument),
                this.enqueue(element, callback, full)
            );
        }
        else {
            var notify = this.enqueue(element, callback, full);
            
            if (sonar) {
                // FIXME: should probably guarantee that body is always text.
                sonar.get(url.pathname, function (error, response) {
                    var content = response ? response.body : null;
                    
                    if (error) { return notify(error); }
                    
                    if (
                        element.nodeName === "SCRIPT" && 
                        element.type     === "text/javascript"
                    ) {
                        content = processScript(url.pathname, content);
                    }
                    notify(null, content);
                });
            }
            else {
                this.readFile(url.pathname, notify);
            }
        }
    }
}
load._patched = true;

if (! jsdom.dom.level3.html.resourceLoader.load._patched) {
    jsdom.dom.level3.html.resourceLoader.load = load;
}
