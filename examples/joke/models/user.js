/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var BaseModel = require('./baseModel');

BaseModel.extend(module.exports);

exports.__tableName = 'user';

exports.getUserByUsername = function(username, cb){
    exports.query(
        'SELECT * FROM user WHERE username="'+username+'"',
        function(err, rows, fields){
            cb(err, rows[0]);
        }
    );
};

//exports.insert = function(values, cb){
//    db.insert('user', values, cb);
//};
//
//exports.updateUser = function(values, where, cb){
//    db.update('user', values, where, cb);
//};


