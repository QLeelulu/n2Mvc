#n2Mvc

    n2Mvc is a Web Mvc Framework mostly like ASP.NET MVC.

##Route
    
    // config.js
    exports.init = function(){
        this.route.static('^/favicon.ico');
        this.route.static('^/static/(.*)');
        
        this.route.map(
            'default',
            '/{controller}/{action}/{id}/',
            {controller:'home', action:'index'},
            {id:'\\d+'}
        );
    };

##Controller

    // controllers/home.js
    exports.index = function(){
        //return this.ar.raw('hello world');
        return this.ar.view({msg: 'hello world'});
    };



