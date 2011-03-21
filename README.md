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

+ get  `/home/index` will call `exports.index_get`
+ post `/home/index` will call `exports.index`

        // controllers/home.js
        exports.index = function(fnNext){
            //return this.ar.raw('hello world');
            fnNext( this.ar.view({msg: 'hello world'}) );
        };
        exports.index_get = function(){
            //return this.ar.raw('hello world');
            fnNext( this.ar.view({msg: 'hello world'}) );
        };

  You must call the `fnNext` to continue handler the request.


##Action Filter

    var myFilter = function(){
        this.onControllerExecuting = function(ctx, fnNext){
            // ctx.req --> the httpRequest object
            // ctx.res --> the httpResponse object
            // ctx.routeData --> the route info
            // ctx.ar --> the actionresults method
            // you can log or check the auth here
            if(!checkAuth(ctx.req)){
                fnNext( this.ar.redirect('/login') );
            }
        };
        this.onControllerExecuted = function(ctx, fnNext){
            fnNext();
        };
        this.onActionExecuting = function(ctx, fnNext){
            fnNext();
        };
        this.onActionExecuted = function(ctx, fnNext){
            fnNext();
        };
        this.onResultExecuting = function(ctx, fnNext){
            fnNext();
        };
        this.onResultExecuted = function(ctx){
            fnNext();
        };
    };
    
    // Add filter to the controller
    this.filters = [new myFilter()];
    
    exports.index = function(){
        return this.ar.view({msg: 'hello world'});
    };
    // Add filter to the action
    exports.index.filters = [new myFilter()];
  
  You must call the `fnNext` to continue handler the request. To end the request, you can put any actionResult to `fnNext`, just like `fnNext('end')`
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

##ViewEngine

  coming soon
  
## Authors

 - QLeelulu
 - fengmk2
 - waiting for you


## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file.
