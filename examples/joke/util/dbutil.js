/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('../../../lib/util/class');
var utilities = require('../../../lib/util/utilities'),
    MySQLPool = require("../refLib/mysql-pool").MySQLPool;


var MysqlDefalutParams = {
    host:'127.0.0.1',
    port: 3306
};

var MysqlOperator = exports.MysqlOperator = Class.extend({
    init: function(options){
        this.options = utilities.extend(MysqlDefalutParams, options);
        
        this.dbpool = new MySQLPool({database: this.options.database});
        this.dbpool.properties.user = this.options.user;
        this.dbpool.properties.password = this.options.password;
        this.dbpool.properties.host = this.options.host;
        this.dbpool.properties.port = this.options.port;
        this.dbpool.connect(5);
    },
    open: function(){
    },
    close: function(){
    },
    query: function(sql, cb){
        this.dbpool.query(sql, function(err, rows, fields) {
            cb(err, rows, fields);
        });
    },
    exec: function(method, table, values, where, cb){
        var str = '', sql = '';
        if(values){
            for(var k in values){
                str += k + '="' + values[k] + '",';
            }
            str = str.slice(0, -1);
        }
        switch(method){
            case 'C':
                sql = 'INSERT INTO ' + table + ' SET ' + str;
                break;
            case 'U':
                sql = 'UPDATE ' + table + ' SET ' + str;
                sql += where ? (' WHERE ' + where) : '';
                break;
            case 'D':
                sql = 'DELETE FROM ' + table + ' WHERE ' + where;
                break;
        }
        this.query(sql, function(err, rows, fields){
            cb(err, rows, fields);
        });
    },
    insert: function(table, values, cb){
        this.exec('C', table, values, '', function(err, rows, fields){
            var success = (!err && rows.affectedRows>0) ? true : false;
            cb(err, success);
        });
    },
    update: function(table, values, where, cb){
        this.exec('U', table, values, where, function(err, rows, fields){
            var success = (!err && rows.affectedRows>0) ? true : false;
            cb(err, success);
        });
    },
    'delete': function(table, where, cb){
        this.exec('D', table, '', where, function(err, rows, fields){
            var success = (!err && rows.affectedRows>0) ? true : false;
            cb(err, success);
        });
    }
});
