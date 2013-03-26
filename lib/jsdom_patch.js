var fs    = require("fs"),
    jsdom = require("jsdom"),
    path  = require("path");

var JQUERY = fs.readFileSync(
        path.join(__dirname, "jquery.js"),
        { encoding: "utf-8" }
    );

jsdom.jQueryify = jsdom.jsdom.jQueryify = function (window) {
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
};
