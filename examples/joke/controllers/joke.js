/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var jokeModel = require('../models/joke'),
    userAuthFilter = require('../filters/auth').userAuthFilter;

exports.show = function(fnNext){
    var _t = this, jokeId = this.routeData.args.id;
    jokeId = Number(jokeId);
    if(isNaN(jokeId) || jokeId < 1){
        return fnNext( this.ar.notFound() );
    }
    
    jokeModel.getById(jokeId, function(err, joke){
        var r = {}
        if(joke){
            r.joke = joke;
        }
        fnNext( _t.ar.view({joke:joke}) );
    });
};

exports.comments = function(fnNext){
    var _t = this, jokeId = this.routeData.args.id;
    jokeId = Number(jokeId);
    if(isNaN(jokeId) || jokeId < 1){
        return fnNext( this.ar.json({}) );
    }
    
    jokeModel.getCommentsByJokeId(jokeId, function(err, comments){
        return fnNext( _t.ar.json({error:err, comments:comments}) );
    });
};

exports.add = function(fnNext){
    return fnNext( this.ar.view() );
};
exports.add.filters = [userAuthFilter];

exports.add_post = function(fnNext){
    var _t = this,
        r = {};
    
    if(_t.req.post.content){
        var joke = {
            content: _t.req.post.content,
            title: _t.req.post.title || ''
        };
        joke.created_time = joke.updated_time = (new Date()).format('yyyy-MM-dd hh:mm:ss');
        jokeModel.insert(joke, 
            function(err, success, insertId){
                if(success){
                    r.id = insertId;
                    r.success = true;
                }else{
                    r.error = '更新数据库失败'
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = '请填写内容';
        fnNext( this.ar.json(r) );
    }
};
exports.add_post.filters = [userAuthFilter];