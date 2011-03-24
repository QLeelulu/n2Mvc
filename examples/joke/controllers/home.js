/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var jokeModel = require('../models/joke')

exports.index = function(fnNext){
    var _t = this,
        pagesize = 20,
        page = Number(this.req.get.page);
    page = (isNaN(page) || page < 1) ? 1 : page;
    jokeModel.getByPage(page, pagesize, function(err, jokes, fields){
        fnNext( _t.ar.view( {jokes:jokes} ) );
    });
    //fnNext( _t.ar.view() );
};

