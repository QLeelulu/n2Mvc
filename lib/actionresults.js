require('./util/class');

var path = require('path'),
    ViewEngine = require('./viewengine').ViewEngine;



var ActionResult = this.ActionResult = Class.extend({
    init: function(body, headers, statusCode) {
        this.statusCode = statusCode || 200;
        this.headers = headers || {'Content-Type': 'text/html'};
        this.body = body;
        this.tempDatas = [];
    },
    executeResult: function(req, res, fnCallback) {
        res.writeHead(this.statusCode, this.headers);
        if (this.body) {
            res.write(this.body);
        }
        fnCallback();
    }
});

var ViewResult = this.ViewResult = ActionResult.extend({
    init: function(data, viewPath) {
        this._super();
        this.data = data || {};
        this.viewPath = viewPath;
    },
    executeResult: function(req, res, fnCallback) {
        var _t = this;
        _t.data.req = req;
        _t.data.res = res;
        this.body = ViewEngine.render(this.filePath, this.data, function(tResult){
            _t.body = tResult;
            _t._super(req, res, fnCallback);
        });
    }
});

this.view = function(data, viewPath) {
  return new ViewResult(data, viewPath);
};

this.redirect = function(url) {
  return new ActionResult('Redirecting...', {'Content-Type': 'text/html', 'Location': url}, 302);
};

this.redirectPermanent = function(url) {
  return new ActionResult('Redirecting...', {'Content-Type': 'text/html', 'Location': url}, 301);
};

this.notFound = notFound = function(msg) {
  return new ActionResult(msg || 'Not found.', {'Content-Type': 'text/html'}, 404);
};

this.notModified = notModified = function() {
  return new ActionResult(null, [], 304);
};

this.error = error = function(err, httpStatusCode) {
  var msg = err instanceof Error ? err.message + '\r\n' + err.stack : err;
  return new ActionResult(msg, {'Content-Type': 'text/plain'}, httpStatusCode || 500);
};

this.raw = function(data) {
  return new ActionResult(data, {'Content-Type': 'text/plain'});
};

this.json = function(data) {
  return new ActionResult(JSON.stringify(data), {'Content-Type': 'application/json'});
};

