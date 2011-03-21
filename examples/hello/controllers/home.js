/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var myFilter = function(target){
    this.target = target;
    
    this.onControllerExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onControllerExecuting \r\n<br/>');
        fnNext('end');
    };
    this.onControllerExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onControllerExecuted \r\n<br/>');
        fnNext('end');
    };
    this.onActionExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onActionExecuting \r\n<br/>');
        fnNext();
    };
    this.onActionExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onActionExecuted \r\n<br/>');
        fnNext();
    };
    this.onResultExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onResultExecuting \r\n<br/>');
        fnNext();
    };
    this.onResultExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onResultExecuted \r\n<br/>');
        fnNext();
    };
};

this.filters = [
    new myFilter('homeController'), new myFilter('homeController2')
];

exports.index = function(fnNext){
    //return this.ar.raw('hello world');
    fnNext( this.ar.view({msg: 'hello world'}) );
};
exports.index.filters = [
    new myFilter('indexAction'), new myFilter('indexAction2')
];

exports.index_post = function(fnNext){
    //return this.ar.raw('hello world');
    fnNext( this.ar.view({msg: 'hello world -> get<br/>'}) );
};

exports.json = function(fnNext){
    fnNext( this.ar.json({msg: 'hello world'}) );
};