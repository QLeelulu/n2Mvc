/**
 * @author qleelulu
 * @blog http://qleelulu.cnblogs.com
 */

var connect = require('connect'),
    core = require('./core');

exports.createServer = function(port){
    port = port || 8080;
    connect.createServer(function(req, res, next){
        core.processRequest(req, res);
    }).listen(port, '0.0.0.0');
    
    console.log('Server running at http://127.0.0.1:'+ port +'/');
};

