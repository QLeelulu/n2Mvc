
var path = require('path'),
    fs = require('fs'),
    Class = require('./util/class').Class,
    utilities = require('./util/utilities'),
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
        var _t = this, ctx = {"viewdata": _t.data, "req":req, "res":res};
        ctx.vd = ctx.viewdata;
        this.body = ViewEngine.render(_t.filePath, ctx, function(tResult){
            _t.body = tResult;
            _t._super(req, res, fnCallback);
        });
    }
});

var ContentResult = this.ContentResult = ActionResult.extend({
  init: function(filename) {
    this._super(null, []);
    this.filename = filename;
  },
  executeResult: function(req, res, fnCallback) {
    var _t = this;
    var filename = this.filename;
    fs.stat(filename, function(err, stat) {
      if (err) {
        if (err.errno && err.errno === 2) {
          notFound('Static content not found.').executeResult(req, res, fnCallback);
          return;
        }
      }
      var etag = Number(stat.mtime);
      if (req.headers['if-none-match'] &&
          req.headers['if-none-match'] == etag) {
        notModified().executeResult(req, res, fnCallback);
        return;
      }
      _t.headers.push(['Content-Length', stat.size]);
      _t.headers.push(['ETag', etag]);
      var first = true;
      var stream = fs.createReadStream(filename);
      stream
        .addListener('error', function(err) {
          if (first) {
            return error(err).executeResult(req, res, fnCallback);
          }
          stream.destroy();
          req.end();
        })
        .addListener('data', function(data){
          if (first) {
            first = false;
            var ext = path.extname(filename);
            ext = ext ? ext.slice(1) : '';
            var contentType = utilities.mimeTypes.lookup(ext);
            _t.headers.push(['Transfer-Encoding', 'chunked']);
            _t.headers.push(['Content-Type', contentType]);
            res.writeHead(200, _t.headers);
          }
          res.write(data, 'binary');
        })
        .addListener('end', function() {
          //res.end();
          fnCallback();
        });
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

this.raw = function(data, contentType) {
  return new ActionResult(data, {'Content-Type': contentType || 'text/plain'});
};

this.json = function(data) {
  return new ActionResult(JSON.stringify(data), {'Content-Type': 'application/json'});
};

this.content = function(filename) {
  return new ContentResult(filename);
};

