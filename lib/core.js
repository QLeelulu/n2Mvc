/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('./util/class');
var path = require('path'),
    url = require('url'),
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
    
    __middlewares = config.middlewares || __middlewares;
};

/****************************
 * process request.
 */
exports.processRequest = function(req, res){
    responseWrap(res);
    res.errorHandler = errorHandler;
    try{
        var handler = null, routeInfo = route.getRouteData(req.url, req.method);
        if(routeInfo.isStaticFile){
            handler = new StaticFileHandler(req, res, routeInfo.path);
        }else{
            handler = new MvcHandler(req, res, routeInfo);
        }
        handler.process();
    }catch(err){
        errorHandler(req, res, err);
    }
};

/****************************
 * Response wrap: change the write() and writeHead() method
 * 在ActionResult.execut()的时候会调用res.writeHead()写入Response头，
 * 在这之前调用res.write()写入的内容都写到responseTempDatas中
 */
var responseWrap = function(res){
    var _res = res;
    _res._write = res.write;
    _res._writeHead = res.writeHead;
    _res.hasWriteHeader = false;
    _res.responseTempDatas = [];
    _res.write = function(chunk, encoding){
        if(_res.hasWriteHeader){
            _res._write(chunk, encoding);
        }else{
            _res.responseTempDatas.push(new Buffer(chunk, encoding));
        }
    };
    _res.writeHead = function(statusCode, reasonPhrase, headers){
        if(!_res.hasWriteHeader){
            _res._writeHead(statusCode, reasonPhrase, headers);
            _res.hasWriteHeader = true;
        }
        for(var i in _res.responseTempDatas){
            _res.write(_res.responseTempDatas[i]);
        }
        delete _res.responseTempDatas;
    };
};

/****************************
 * Error Handler
 */
function errorHandler(req, res, err){
    var ar = null, msg = '', stack = '';
    if(err instanceof Error){
        msg = err.message;
        stack = err.stack;
    }else{
        msg = err;
    }
    
    if(Settings.DEBUG){
        console.error('url: ' + req.url + '\r\n' + msg + '\r\n' + stack);
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
    });
    //res.end();
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
    process: function(){
        var _t = this,
            ctx = {
                req: this.req,
                res: this.res,
                routeData: this.routeData
            },
            c = new ControllerFactory(ctx);
        
        c.execute(function(){
            _t.res.end();
        });
        //TODO: ensureResposeEnd
        //this.res.end();
    }
});

var StaticFileHandler = exports.StaticFileHandler = RequestHandler.extend({
    init: function(req, res, filePath){
        this._super(req, res);
        filePath = filePath || url.parse(req.url).pathname;
        this.filePath = path.join(Settings.projectDir, Settings.staticFileDir, filePath);
    },
    process: function(){
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
                _t.res.end();
            });  
        });
    }
});
//************************* <--


/************************* -->
 * ControllerFactory
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
                throw e;
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

/****************************
 * Middleware
 */
function executMiddleware(eventName, req, res){
    var r = null, ctx = {req:req, res:res};
    for(var i in __middlewares){
        if(__middlewares[i][eventName]){
            r = this.__middlewares[i][eventName](ctx);
            if( r ){
                r = this.processActionResult(r);
                //if return any result, then cancel the process after
                break;
            }
        }
    }
    this.ctx.res.write = _resWrite;
    return r;
};
