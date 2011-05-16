/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.DEBUG = true;

exports.projectDir = __dirname;

exports.staticFileDir = 'static';



exports.init = function(){
    this.route.static('^/favicon.ico');
    this.route.static('^/static/(.*)');
    
    this.route.map(
        'default',
        '/{controller}/{action}/',
        {controller:'home', action:'index'},
        {id:'\\d+'}
    );
};

exports.middlewares = [
    'cookie',
    'multipart'
];