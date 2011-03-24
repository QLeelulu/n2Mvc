/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require('./util/monkey_patching')
var server = require('../../lib/server'),
    config = require('./config');

server.createServer(config);