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

##Controller And Action

  - get  `/home/index` will call `exports.index_get`
  - post `/home/index` will call `exports.index`
  
    // controllers/home.js
    exports.index = function(){
        //return this.ar.raw('hello world');
        return this.ar.view({msg: 'hello world'});
    };
    exports.index_get = function(){
        //return this.ar.raw('hello world');
        return this.ar.view({msg: 'hello world'});
    };


##Action Filter

    var myFilter = function(){
        this.onControllerExecuting = function(ctx){
            // ctx.req --> the httpRequest object
            // ctx.res --> the httpResponse object
            // ctx.routeData --> the route info
            // ctx.ar --> the actionresults method
            // you can log or check the auth here
            if(!checkAuth(ctx.req)){
                return this.ar.redirect('/login');
            }
        };
        this.onControllerExecuted = function(ctx){
            //
        };
        this.onActionExecuting = function(ctx){
            //
        };
        this.onActionExecuted = function(ctx){
            //
        };
        this.onResultExecuting = function(ctx){
            //
        };
        this.onResultExecuted = function(ctx){
            //
        };
    };
    
    // Add filter to the controller
    this.filters = [new myFilter()];
    
    exports.index = function(){
        return this.ar.view({msg: 'hello world'});
    };
    // Add filter to the action
    exports.index.filters = [new myFilter()];

  Order of the filters execution is:
    1. `onControllerExecuting`
    2. `onActionExecuting`
    2.  the action execute
    3. `onResultExecuting`
    4.  the actionResult execute
    5. `onResultExecuted`
    6. `onActionExecuted`
    7. `onControllerExecuted`

##Middleware

  coming soon


