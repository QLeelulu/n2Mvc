var fs = require('fs');

require('util/class');

this.ActionResult = Class.extend({
    init: function(body, headers, statusCode) {
        this.statusCode = statusCode || 200;
        this.headers = headers || {'Content-Type': 'text/html'};
        this.body = body;
    },
    execute: function(req, res) {
        res.writeHead(this.statusCode, this.headers);
        if (this.body) {
            res.write(this.body);
        }
    }
});

this.ViewResult = ActionResult.extend({
    init: function(data, viewPath) {
        this._super();
        this.data = data;
    },
    execute: function(req, res, app) {
        var viewResult = this;
        var execute = this._super;
    
    }
});

