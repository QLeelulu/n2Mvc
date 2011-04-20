/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


var assert = require('assert'),
    route = require('../lib/route');

exports.run = function(){
    route.map(
        'default',
        '/myadmin/{action}/{id}',
        {controller:'admin', action:'index', id:'2'},
        {}
    );
    
    route.map(
        'default',
        '/{controller}/{action}/{id}/.*',
        {controller:'home', action:'index', id:'2'},
        {}
    );

    var routeData = route.getRouteData('/');
    assert.strictEqual('home', routeData.controller);
    assert.strictEqual('index', routeData.action);
    assert.strictEqual('2', routeData.args.id);
    
    routeData = route.getRouteData('/blog');
    assert.strictEqual('blog', routeData.controller);
    assert.strictEqual('index', routeData.action);
    assert.strictEqual('2', routeData.args.id);
    
    routeData = route.getRouteData('/blog/page');
    assert.strictEqual('blog', routeData.controller);
    assert.strictEqual('page', routeData.action);
    assert.strictEqual('2', routeData.args.id);
    
    routeData = route.getRouteData('/blog/page/3');
    assert.strictEqual('blog', routeData.controller);
    assert.strictEqual('page', routeData.action);
    assert.strictEqual('3', routeData.args.id);
    
    routeData = route.getRouteData('/blog/page/3/no');
    assert.strictEqual('blog', routeData.controller);
    assert.strictEqual('page', routeData.action);
    assert.strictEqual('3', routeData.args.id);
    
    routeData = route.getRouteData('/myadmin');
    assert.strictEqual('admin', routeData.controller);
    assert.strictEqual('index', routeData.action);
    assert.strictEqual('2', routeData.args.id);
    
    routeData = route.getRouteData('/myadmin/admin');
    assert.strictEqual('admin', routeData.controller);
    assert.strictEqual('admin', routeData.action);
    assert.strictEqual('2', routeData.args.id);
    
    routeData = route.getRouteData('/myadmin/page/3');
    assert.strictEqual('admin', routeData.controller);
    assert.strictEqual('page', routeData.action);
    assert.strictEqual('3', routeData.args.id);
};

exports.run();