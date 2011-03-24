/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */




exports.beginRequest = function(ctx, fnNext){
    ctx.res.write('add in beginRequest \r\n<br/>');
    fnNext();
};

exports.beginMvcHandler = function(ctx, fnNext){
    ctx.res.write('add in beginMvcHandler \r\n<br/>');
    fnNext();
};

exports.endMvcHandler = function(ctx, fnNext){
    ctx.res.write('add in endMvcHandler \r\n<br/>');
    fnNext();
};

exports.endRequest = function(ctx, fnNext){
    ctx.res.write('add in endRequest \r\n<br/>');
    fnNext();
};

