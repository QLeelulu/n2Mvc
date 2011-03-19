/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var myFilter = function(target){
    this.target = target;
    
    this.onControllerExecuting = function(ctx){
        ctx.res.write(this.target + ': onControllerExecuting \r\n<br/>');
    };
    this.onControllerExecuted = function(ctx){
        ctx.res.write(this.target + ': onControllerExecuted \r\n<br/>');
        return 'end';
    };
    this.onActionExecuting = function(ctx){
        ctx.res.write(this.target + ': onActionExecuting \r\n<br/>');
        
    };
    this.onActionExecuted = function(ctx){
        ctx.res.write(this.target + ': onActionExecuted \r\n<br/>');
        
    };
    this.onResultExecuting = function(ctx){
        ctx.res.write(this.target + ': onResultExecuting \r\n<br/>');
    };
    this.onResultExecuted = function(ctx){
        ctx.res.write(this.target + ': onResultExecuted \r\n<br/>');
    };
};

this.filters = [
    new myFilter('homeController'), new myFilter('homeController2')
];

exports.index = function(){
    //return this.ar.raw('hello world');
    return this.ar.view({msg: 'hello world'});
};
exports.index.filters = [
    new myFilter('indexAction'), new myFilter('indexAction2')
];

exports.index_get = function(){
    //return this.ar.raw('hello world');
    return this.ar.view({msg: 'hello world -> get<br/>'});
};

exports.json = function(){
    return this.ar.json({msg: 'hello world'});
};