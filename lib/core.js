/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('./util/class');
require('./refLib/shotenjin');
var route = require('./route');

exports.processRequest = function(req, res){
    var routeInfo = route.getRouteData(req.url, req.method);
    var c = new Controller(routeInfo),
        ctx = {
            req: req,
            res: res,
            routeData: routeInfo
        };
    
    c.execute(ctx);
    //TODO: ensureResposeEnd
    res.end();
};

var Controller = Class.extend({
    init: function(routeData){
        if(routeData.controller && routeDate.action){
            this.controller = require('./controllers/'+actionInfo.controller); // ./controllers/home
            if(this.controller){
                this.action = this.controller[routeDate.action];
            }
        }
    },
    checkAction: function(){
        if(!this.controller){
            // TODO: 404
            throw new Error('Error: no controller named "' + this.controller + '"');
            return false;
        }
        if(!this.action){
            // TODO: 404
            throw new Error('Error: controller "' + this.controller + '" without action "' + this.action + '"');
            return false;
        }
        return true;
    },
    execute: function(ctx){
        if( !this.checkAction() ){ return; }
        
        if( !this.beforeControllerExecute(ctx) ){ return; }
        if( !this.beforeActionExecute(ctx) ){ return; }
        
        var actionResult = this.action.apply(ctx, ctx.routeData.args);
        actionResult.executeResult(ctx);
        
        if( !this.afterActionExecute(ctx) ){ return; }
        if( !this.afterControllerExecute(ctx) ){ return; }
    },
    beforeControllerExecute: function(ctx){
        return true;
    },
    afterControllerExecute: function(ctx){
        return true;
    },
    beforeActionExecute: function(ctx){
        return true;
    },
    afterActionExecute: function(ctx){
        return true;
    }
});

