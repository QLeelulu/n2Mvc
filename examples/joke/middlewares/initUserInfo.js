/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var userModel = require('../models/user')

exports.beginMvcHandler = function(ctx, fnNext){
    var ticket = ctx.req.cookies.ttest;
    if(ticket){
        userModel.getUserByTicket(ticket,function(err, user){
            if(!err){
                ctx.req.user = user;
            }
            return fnNext();
        });
    }else{
        return fnNext();
    }
};

