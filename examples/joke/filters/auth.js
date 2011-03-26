/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.userAuthFilter = {
    onControllerExecuting: function(ctx, fnNext){
        if(ctx.req.user){
            fnNext();
        }else{
            fnNext( ctx.ar.redirect('/user/login') );
        }
    }
};

