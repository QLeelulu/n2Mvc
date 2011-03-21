/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */




exports.beginRequest = function(ctx, fnNext){
    fnNext();
};

exports.beginMvcHandler = function(ctx, fnNext){
    fnNext();
};

exports.endMvcHandler = function(ctx, fnNext){
    fnNext();
};

exports.endRequest = function(ctx, fnNext){
    fnNext();
};

