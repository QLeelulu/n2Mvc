/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var Class = require('./util/class').Class;
var utilities = require('./util/utilities');

var __routes = [], __routesIndex = {}, __staticFileRoutes = [];

var Router = this.Router = Class.extend({
    init: function(name, urlRe, defaults, constraints){
        this.keys = [];
        this.name = name;
        this.defaults = defaults || {};
        this.constraints = constraints || {};
        var _t = this;
        // '/{controller}/{action}/{id}' => '\/?([^\\?#/]+)?\/?([^\\?#/]+)?\/?([^\\?#/]+)?'
        urlRe = urlRe.replace(/\//g, '/?');
        urlRe = urlRe.replace(/\{([\w\-_]+)\}/g, function(m, g1){
            _t.keys.push(g1);
            return _t.constraints[g1] ? ('('+ _t.constraints[g1] +')?') : '([^\\?#/\\.]+)?';
        });
        this.urlRe = new RegExp('^'+ urlRe +'$');
    },
    match: function(url){
        var result = {matched:false}, tmp = this.urlRe.exec(url);
    	if(tmp){
    	    result.matched = true;
    	    result.data = {}
    		for(var i=1; i<tmp.length; i++){
    			if(tmp[i] && this.keys[i-1]){
    				result.data[ this.keys[i-1] ] = tmp[i];
    			}
    		}
    		tmp = utilities.extend({}, this.defaults);
    		result.data = utilities.extend(tmp, result.data);
    	}
    	return result;
    }
});

var StaticFileRouter = this.StaticFileRouter = Class.extend({
    init: function(urlRe){
        this.urlRe = new RegExp(urlRe);
    },
    match: function(url){
        var result = {matched:false, requestUrl:url}, tmp = this.urlRe.exec(url);
    	if(tmp){
    	    result.matched = true;
    	    result.path = tmp[1] || tmp[0];
    	}
    	return result;
    }
});

var RouteResult = this.RouteResult = Class.extend({
    init: function(method, controller, action, args){
        this.method = method;
        this.controller = controller;
        this.action = action;
        this.args = args;
    },
    check: function(){
        
    }
});

/**
 * 注册route规则
 * 示例：
 * route.map(
 *     'default', //name
 *     '/{controller}/{action}/{id}',
 *     {controller: 'blog', action: 'index', id: 2}, //default
 *     {id: '\d{4}'}
 * })
 */
exports.map = function(name, urlRe, defaults, constraints){
    var router = new Router(name, urlRe, defaults, constraints);
    __routes.push(router);
    __routesIndex[name] = router;
};

exports.static = function(urlRe){
    var router = new StaticFileRouter(urlRe);
    __staticFileRoutes.push(router);
};

exports.getRouteData = function(urlPath, method){
    var route = null,
        method = method ? method.toLowerCase() : 'get',
        r = new RouteResult(method);
    
    var l = __staticFileRoutes.length;
    for(var i=0; i<l; i++){
        route = __staticFileRoutes[i].match(urlPath);
        if(route.matched){
            r.isStaticFile = true;
            r.path = route.path;
            return r;
        }
    }
    
    l = __routes.length;
    for(var i=0; i<l; i++){
        route = __routes[i].match(urlPath);
        if(route.matched){
            r.controller = route.data.controller;
            r.action = route.data.action;
            r.args = utilities.extend({}, route.data);
            delete r.args.controller;
            delete r.args.action;
            break;
        }
    }
    return r;
};