/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('./util/class');
var path = require('path'),
    util = require('util'),
    url = require('url'),
    parseURL = require('url').parse,
    querystring = require('querystring'),
    fs = require('fs'),
    route = require('./route'),
    utilities = require('./util/utilities')
    actionResults = require('./actionresults');

var __middlewares = [];

/****************************
 * Global Settings
 */
global.Settings = {
    DEBUG: true,
    projectDir: '',
    staticFileDir: 'static',
    viewPath: 'views'
};

/****************************
 * Init
 */
exports.init = function(config){
    for(var i in Settings){
        if( !utilities.isUndefined( config[i] ) ){
            Settings[i] = config[i];
        }
    }
    if(!Settings.projectDir){
        throw new Error('projectDir must set');
    }
    
    //__middlewares = config.middlewares || __middlewares;
    MiddlewareFactory.init(config.middlewares);
};

/****************************
 * process request.
 */
exports.processRequest = function(req, res){
    responseWrap(res);
    res.errorHandler = errorHandler;
    requestDataParse(req, function(){
        try{
            MiddlewareFactory.execute(req, res);
        }catch(err){
            errorHandler(req, res, err);
        }
    });
    
//    try{
//        var handler = null, routeInfo = route.getRouteData(req.urlPath, req.method);
//        if(routeInfo.isStaticFile){
//            handler = new StaticFileHandler(req, res, routeInfo.path);
//        }else{
//            handler = new MvcHandler(req, res, routeInfo);
//        }
//        handler.process();
//    }catch(err){
//        errorHandler(req, res, err);
//    }
};
/****************************
 * parse request data
 */
var requestDataParse = function(req, callback){
    console.log(req.url)
    var parsedUrl = parseURL(req.url);
    req.urlPath = parsedUrl.pathname;
    req.urlQuery = parsedUrl.query;
    req.get = querystring.parse(req.urlQuery);
    var contentType = req.headers['content-type'] || req.headers['Content-Type'];
    if (!contentType || ! /multipart\/form-data/.test(contentType)) {
        var postedBody = '';
        req.addListener('data', function(chunk) {
            postedBody += chunk;
        });
        req.addListener('end', function() {
            req.post = querystring.parse(postedBody);
            callback();
        });
    }
};


/****************************
 * Response wrap: change the write() and writeHead() method
 * 在ActionResult.executeResult()的时候会调用res.writeHead()写入Response头，
 * 在这之前调用res.write()写入的内容都写到responseTempDatas中
 */
var responseWrap = function(res){
    var _res = res, 
        _write = res.write, 
        _writeHead = res.writeHead;
    _res.hasWriteHeader = false;
    _res.responseTempDatas = [];
    
    _res.write = function(chunk, encoding){
        if(_res.hasWriteHeader){
            _write.apply(_res, [chunk, encoding] );
        }else{
            _res.responseTempDatas.push(new Buffer(chunk, encoding));
        }
    };
    _res.writeHead = function(statusCode, reasonPhrase, headers){
        if(!_res.hasWriteHeader){
            _writeHead.apply(_res, [statusCode, reasonPhrase, headers] );
            _res.hasWriteHeader = true;
        }
        _res.responseTempDatas.forEach(function(v,k){
            _res.write(v);
        });
        delete _res.responseTempDatas;
    };
};

/****************************
 * Error Handler
 */
process.addListener('uncaughtException', function(err){
    console.log('error')
    if(err  instanceof n2Error){
        errorHandler(err.req, err.res, err.err);
    }else{
        var msg = '', stack = '';
        if(err instanceof Error){
            msg = err.message;
            stack = err.stack;
        }else{
            msg = err;
        }
        console.error(msg + '\r\n' + stack);
        console.log('\r\n\r\n'+'!!!!!!' + '\r\n\r\n')
    }
});
var n2Error = function(req, res, err){
    this.req = req;
    this.res = res;
    this.err = err;
};

var errorHandler = function(req, res, err){
    var ar = null, msg = '', stack = '';
    if(err instanceof Error){
        msg = err.message;
        stack = err.stack;
    }else{
        msg = err;
    }
    
    if(Settings.DEBUG){
        //console.error('url: ' + req.url + '\r\n' + msg + '\r\n' + stack);
    }
    
    if(msg.indexOf('404') == 0){
        if(Settings.DEBUG){
            ar = actionResults.raw(msg + '\r\n' + stack);
        }else{
            ar = actionResults.notFound();
        }
    }else{
        ar = actionResults.raw(msg + '\r\n' + stack);
    }
    ar.executeResult(req, res, function(){
        res.end();
        console.log('end\r\n')
    });
    //res.end();
};


/****************************
 * Middleware 
 * (May be this is the request handler factory?)
 */
var MIDDLEWARE_EXECUTE_ORDER = ['beginRequest', 'beginMvcHandler', 'processRequest', 'endMvcHandler', 'endRequest'];
var MiddlewareFactory = {
    /*
     * @middlewares: (Array), the middleware config list
     */
    init: function(middlewares){
        var m = null, l = middlewares.length;
        middlewares.forEach(function(m){
            if(!m){
                throw new Error('Wrong Middleware Config');
            }
            if(typeof m === 'string'){
                try{
                    m = require( path.join(__dirname, 'middlewares', m) );
                }catch(err){
                    try{
                        m = require( path.join(Settings.projectDir, 'middlewares', m) );
                    }catch(err){
                        throw new Error('Can not find middleware "' + m + '"');
                    }
                }
            }
            __middlewares.push(m);
        });
    },
    execute: function(req, res){
        var ctx = {req:req, res:res, ar:actionResults, handler:null}
        MiddlewareFactory.executeWrap(0, ctx, function(){
            res.end();
        });
    },
    executeWrap: function(i, ctx, callbackFn){
        var eventName = MIDDLEWARE_EXECUTE_ORDER[i];
        if(eventName){
            if(eventName === 'processRequest'){
                ctx.handler.process(function(){
                    i++;
                    MiddlewareFactory.executeWrap(i, ctx, callbackFn);
                });
            }else{
                if(eventName === 'beginMvcHandler' && ctx.routeData.isStaticFile){
                    i++;
                    MiddlewareFactory.executeWrap(i, ctx, callbackFn);
                    return;
                }
                MiddlewareFactory.executeMiddlewares(eventName, ctx, function(actionResult){
                    if(actionResult){
                        actionResult.executeResult(ctx.req, ctx.res, function(){
                            callbackFn();
                        });
                    }else{
                        if(eventName === 'beginRequest'){
                            ctx.routeData = route.getRouteData(ctx.req.urlPath, ctx.req.method);
                            if(ctx.routeData.isStaticFile){
                                ctx.handler = new StaticFileHandler(ctx.req, ctx.res, ctx.routeData.path);
                            }else{
                                ctx.handler = new MvcHandler(ctx.req, ctx.res, ctx.routeData);
                            }
                        }
                        i++;
                        MiddlewareFactory.executeWrap(i, ctx, callbackFn);
                    }
                });
            }
        }else{
            callbackFn();
        }
    },
    executeMiddlewares: function(eventName, ctx, callbackFn){
        MiddlewareFactory.executeMiddleware(eventName, 0, ctx, callbackFn);
    },
    executeMiddleware: function(eventName, i, ctx, callbackFn){
        if(__middlewares[i] && __middlewares[i][eventName]){
            __middlewares[i][eventName](ctx, function(result){
                if(result){
                    result = MiddlewareFactory.processActionResult(result);
                    callbackFn(result);
                }else{
                    i++;
                    MiddlewareFactory.executeMiddleware(eventName, i, ctx, callbackFn);
                }
            });
        }else{
            callbackFn();
        }
    },
    processActionResult: function(actionResult){
        if (actionResult instanceof actionResults.ActionResult) {
            if (actionResult instanceof actionResults.ViewResult) {
                if(!actionResult.viewPath){
                    throw new Error('Must specify the viewPath');
                }
                actionResult.filePath = path.join(Settings.projectDir, Settings.viewPath, actionResult.viewPath);
            }
            return actionResult;
        } else if (actionResult instanceof Object) {
            return actionResults.json(actionResult);
        } else if (typeof actionResult === 'string') {
            return actionResults.raw(actionResult);
        } else {
            throw new Error('Bad action result.');
        }
    }
};

/******************************** -->
 * RequestHandler
 */
// 不知面向对象的写法对于性能的影响有多大呢？创建对象、销毁对象...
var RequestHandler = exports.RequestHandler = Class.extend({
    init: function(req, res){
        this.req = req;
        this.res = res;
        
    },
    process: function(){
        throw new Error('Not Implement');
    }
});

var MvcHandler = exports.MvcHandler = RequestHandler.extend({
    init: function(req, res, routeData){
        this._super(req, res);
        this.routeData = routeData;
    },
    process: function(callbackFn){
        var _t = this,
            ctx = {
                req: this.req,
                res: this.res,
                routeData: this.routeData
            },
            c = new ControllerFactory(ctx);
        
        c.execute(callbackFn);
        //this.res.end();
    }
});

var StaticFileHandler = exports.StaticFileHandler = RequestHandler.extend({
    init: function(req, res, filePath){
        this._super(req, res);
        filePath = filePath || url.parse(req.url).pathname;
        this.filePath = path.join(Settings.projectDir, Settings.staticFileDir, filePath);
    },
    process: function(callbackFn){
        var _t = this;
        path.exists(_t.filePath, function(exists) {  
            if(!exists) {
                if(Settings.DEBUG){
                    console.log('file "' + _t.filePath + '" not exists');
                }
                errorHandler(_t.req, _t.res, '404');
                return;
            }  
            fs.readFile(_t.filePath, "binary", function(err, file) {  
                if(err) {  
                    errorHandler(_t.req, _t.res, err);
                    return;  
                }
                var ext = path.extname(_t.filePath);
                ext = ext ? ext.slice(1) : 'html';
                _t.res.writeHead(200, {'Content-Type': utilities.mimeTypes.lookup(ext)});
                _t.res.write(file, "binary");
                //_t.res.end();
                callbackFn();
            });  
        });
    }
});
//************************* <--


/************************* -->
 * ControllerFactory
 * execute -> executeWrap(recursion, loop filter events) -> executeFilters -> executeFilter(recursion, loop filters)
 */
var CONTROLLER_EXECUTE_ORDER = ['onControllerExecuting', 'onActionExecuting', 'executeAction', 'onResultExecuting', 'executeActionResult', 'onResultExecuted', 'onActionExecuted', 'onControllerExecuted'];
var ControllerFactory = exports.ControllerFactory = Class.extend({
    init: function(ctx){
        this.ctx = ctx;
        var routeData = ctx.routeData;
        if(routeData.controller && routeData.action){
            var cPath = path.join(Settings.projectDir, 'controllers', routeData.controller);
            
            try {
                this.controller = require(cPath); // controllers/home
            } catch (e) {
                throw new n2Error(ctx.req, ctx.res, e);
            }
            
            if(this.controller){
                this.action = this.controller[routeData.action + '_' + routeData.method] || this.controller[routeData.action];
            }
            
            this.checkAction();
            
        }else{
            throw new Error('404: No route was matched');
        }
    },
    checkAction: function(){
        if(!this.controller){
            throw new Error('404: No controller called "' + this.ctx.routeData.controller + '"');
        }
        if(!this.action){
            throw new Error('404: The "' + this.ctx.routeData.controller + '" controller doesn\'t have an action called "' + this.ctx.routeData.action + '"');
        }
        
        this.filters = this.controller.filters || [];
        this.filters = this.filters.concat( this.action.filters || [] );
        
        return true;
    },
    processActionResult: function(actionResult){
        if (actionResult instanceof actionResults.ActionResult) {
            if (actionResult instanceof actionResults.ViewResult) {
                actionResult.viewPath = actionResult.viewPath || path.join(this.ctx.routeData.controller, this.ctx.routeData.action + '.html');
                actionResult.filePath = path.join(Settings.projectDir, Settings.viewPath, actionResult.viewPath);
                actionResult.data.routeData = this.ctx.routeData;
            }
            return actionResult;
        } else if (actionResult instanceof Object) {
            return actionResults.json(actionResult);
        } else if (typeof actionResult === 'string') {
            return actionResults.raw(actionResult);
        } else {
            throw new Error('Bad action result.');
        }
    },
    execute: function(fnEndRequest){
        var _t = this;
        this.ctx.ar = actionResults;
        
        this.executeWrap(0, fnEndRequest);
    },
    executeWrap: function(i, fnEndRequest){
        var _t = this, filterEventName = CONTROLLER_EXECUTE_ORDER[i];
        if(filterEventName){
            // 'executeAction' and 'executeActionResult' are action process, not the filter event
            if(filterEventName === 'executeAction'){
                this.actionResult = this.action.call(this.ctx, function(result){
                    _t.actionResult = _t.processActionResult(result);
                    i++;
                    _t.executeWrap(i, fnEndRequest);
                });
            }else if(filterEventName === 'executeActionResult'){
                this.actionResult.executeResult(this.ctx.req, this.ctx.res, function(){
                    i++;
                    _t.executeWrap(i, fnEndRequest);
                });
            }else{
                
                this.executeFilters(filterEventName, function(actionResult){
                    if(actionResult){
                        actionResult.executeResult(_t.ctx.req, _t.ctx.res, function(){
                            fnEndRequest();
                        });
                    }else{
                        i++;
                        _t.executeWrap(i, fnEndRequest);
                    }
                });
            }
        }else{
            fnEndRequest();
        }
    },
    executeFilters: function(filterEventName, fn){
        this.executeFilter(this.filters, filterEventName, 0, fn);
    },
    executeFilter: function(filters, filterEventName, i, fn){
        if(filters[i] && filters[i][filterEventName]){
            var _t = this;
            filters[i][filterEventName](_t.ctx, function(result){
                if(result){
                    result = _t.processActionResult(result);
                    fn(result);
                }else{
                    i++;
                    _t.executeFilter(filters, filterEventName, i, fn);
                }
            });
        }else{
            fn();
        }
    }
});

