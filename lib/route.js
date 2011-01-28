/**
 * @author qleelulu
 * @blog http://qleelulu.cnblogs.com
 */

var parseURL = require('url').parse;

//根据http请求的method来分别保存route规则
var routes = {get:[], post:[], head:[], put:[], delete:[]};

/**
 * 注册route规则
 * 示例：
 * route.map({
 *     method:'post',
 *     url: /\/blog\/post\/(\d+)\/?$/i,
 *     controller: 'blog',
 *     action: 'showBlogPost'
 * })
 */
exports.map = function(dict){
    if(dict && dict.url && dict.controller){
        var method = dict.method ? dict.method.toLowerCase() : 'get';
        routes[method].push({
            u: dict.url, //url匹配正则
            c: dict.controller,
            a: dict.action || 'index'
        });
    }
};

exports.getActionInfo = function(url, method){
    var r = {controller:null, action:null, args:null},
        method = method ? method.toLowerCase() : 'get',
        // url: /blog/index?page=1 ,则pathname为: /blog/index
        pathname = parseURL(url).pathname;
    var m_routes = routes[method];
    for(var i in m_routes){
        //正则匹配
        r.args = m_routes[i].u.exec(pathname);
        if(r.args){
            r.controller = m_routes[i].c;
            r.action = m_routes[i].a;
            r.args.shift(); //第一个值为匹配到的整个url，去掉
            break;
        }
    }
    //如果匹配到route，r大概是 {controller:'blog', action:'index', args:['1']}
    return r;
};