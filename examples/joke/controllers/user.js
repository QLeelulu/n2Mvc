/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var userModel = require('../models/user'),
    crypto = require('crypto');

exports.register = function(fnNext){
    fnNext( this.ar.view() );
};

exports.register_post = function(fnNext){
    var r = {}, _t = this;
    if(!this.req.post.username || 
       !this.req.post.password || 
       !this.req.post.password2 || 
       !this.req.post.email ){
        r.error = '请填写完整资料';
        
    }
    if(!r.error && (this.req.post.password !== this.req.post.password2) ){
        r.error = '两次填写的密码不一致';
    }
    if(r.error){
        fnNext( this.ar.json(r) );
        return;
    }
    
    userModel.getUserByUsername(this.req.post.username, function(err, user){
        if(err){
            r.error = err.message;
        }else if(user){
            r.error = '用户名已经存在';
        }
        if(r.error){
            fnNext( _t.ar.json(r) );
            return;
        }
        
        var user = {
            username: _t.req.post.username,
            password: crypto.createHash('md5').update(_t.req.post.password).digest("hex"),
            email:    _t.req.post.email
        };
        var now = new Date();
        user.created_time = user.updated_time = now.format('yyyy-MM-dd hh:mm:ss');
        userModel.insert(user, function(err, success){
            if(success){
                r.success = true;
            }else{
                console.log(err);
                r.error = '插入数据失败';
            }
            fnNext( _t.ar.json(r) );
        });
        
    });
};

exports.login = function(fnNext){
    fnNext( this.ar.view() );
};

exports.login_post = function(fnNext){
    var r = {}, _t = this;
    if(!this.req.post.username || 
       !this.req.post.password ){
        r.error = '请填写用户名和密码';
        
        fnNext( this.ar.json(r) );
        return;
    }
    
    userModel.getUserByUsername(this.req.post.username, function(err, user){
        if(err){
            r.error = err.message;
        }else if(!user){
            r.error = '用户不存在或者密码错误';
        }else if(crypto.createHash('md5').update(_t.req.post.password).digest("hex") !== user.password ){
            r.error = '用户不存在或者密码错误';
        }else{
            fnNext( _t.ar.redirect('/') );
            return;
        }
        r.username = _t.req.post.username;
        fnNext( _t.ar.view( r ) );
        
    });
};



