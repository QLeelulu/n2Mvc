/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('../../../lib/util/class');

var MysqlOperator = require('../util/dbutil').MysqlOperator,
    db = new MysqlOperator({user:'root', password:'123456', database:'joke'});

exports.__tableName = '';

exports.query = function(sql, cb){
    db.query(sql, cb);
};

exports.extend = function(obj){
    for(var i in module.exports){
        obj[i] = module.exports[i];
    }
};

exports.getByPage = function(page, pagesize, cb){
    var offset = (page-1) * pagesize;
    db.query(
        'SELECT * FROM ' + this.__tableName +' ORDER BY id DESC LIMIT ' + offset + ', ' + pagesize,
        function(err, rows, fields){
            cb(err, rows);
        }
    );
};

exports.getById = function(jokeId, cb){
    db.query(
        'SELECT * FROM '+ this.__tableName +' WHERE id='+jokeId,
        function(err, rows, fields){
            cb(err, rows[0]);
        }
    );
};

exports.insert = function(values, cb){
    db.insert(this.__tableName, values, cb);
};

exports.update = function(values, where, cb){
    db.update(this.__tableName, values, where, cb);
};

exports['delete'] = function(where, cb){
    db.update(this.__tableName, where, cb);
};
