/**
 * @author qleelulu
 * @blog http://qleelulu.cnblogs.com
 */

var path = require('path'),
    http = require('http'),
    route = require('./route'),
    core = require('./core');

exports.createServer = function(config, port){
    if(!config){
        throw new Error("No Config")
    }
    core.init(config);
    config.init.apply({
        route: route
    });
    port = port || 8080;
    http.createServer(
        function(req, res){
            core.processRequest(req, res);
        }
    ).listen(port, '0.0.0.0');
    
    console.log((new Date()).toString() + ': Server running at http://127.0.0.1:'+ port +'/');
};

