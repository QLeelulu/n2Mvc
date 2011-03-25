/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var userModel = require('../models/user'),
    crypto = require('crypto');

exports.register = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
    fnNext( this.ar.view() );
};

exports.register_post = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
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
            ticket: crypto.createHash('md5').update( _t.req.post.username + Date.now() ).digest("hex"),
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
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }else{
        fnNext( this.ar.view() );
    }
};

exports.login_post = function(fnNext){
    if(this.req.user){
        fnNext( this.ar.redirect('/') );
    }
    
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
            
            userModel.update({last_login: (new Date()).format('yyyy-MM-dd hh:mm:ss')}, 'id='+user.id, function(){
                //更新最后登录时间，这种情况下异步就爽了，扔一边让它去更新，然后无视，继续干其他的
            });
            
            //这么烂的登录认证票据，只好整个SB点的cookie名称糊弄下小黑们
            var cookieOptions = {path: '/'};
            if(_t.req.post.rememberMe){
                cookieOptions.expires = new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 );
            }
            _t.res.cookies.set('ttest', user.ticket, cookieOptions);
            fnNext( _t.ar.redirect('/') );
            return;
        }
        r.username = _t.req.post.username;
        fnNext( _t.ar.view( r ) );
        
    });
};

exports.logout = function(fnNext){
    if(this.req.user){
        this.res.cookies.clear('ttest', {path:'/'});
    }
    fnNext( this.ar.redirect('/') );
};


