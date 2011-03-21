/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.beginMvcHandler = function(ctx, fnNext){
    ctx.res.cookies = new responseCookies();
    var _writeHead = ctx.res.writeHead;
    ctx.res.writeHead = function(){
        if (ctx.res.cookies._cookies){
            ctx.res.setHeader('Set-Cookie', ctx.res.cookies._cookies);
        }
        _writeHead.apply(this, arguments)
    };
    
    var cookie = ctx.req.headers.cookie;
    if (ctx.req.cookies){
        return fnNext();
    }
    ctx.req.cookies = {};
    if (cookie) {
      //try {
        ctx.req.cookies = parseCookie(cookie);
      //} catch (err) {
      //  ctx.res.errorHandler(ctx.req, ctx,res, err);
      //}
    }
    fnNext();
};


var parseCookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim().toLowerCase()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // Quoted values
    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    // Only assign once
    if (obj[key] === undefined) {
      obj[key] = decodeURIComponent(val.replace(/\+/g, ' '));
    }
  }
  return obj;
};

var responseCookies = function(){
    this._cokies = [];
};
responseCookies.prototype.set = function( name, value, options ){
    var cookies = this._cookies || ( this._cookies = [] ),
        cookie = [ name, "=", value, ";" ];
    
    options = options || {};
    
    if ( options.expires ){
      cookie.push( " expires=", (new Date(options.expires)).toUTCString(), ";" );
    }
    
    if ( options.path ){
      cookie.push( " path=", options.path, ";" );
    }
    
    if ( options.domain ){
      cookie.push( " domain=", options.domain, ";" );
    }
    
    if ( options.secure ){
      cookie.push( " secure", ";" );
    }
    
    if ( options.httpOnly ){
      cookie.push( " httponly" );
    }
    
    cookies.push( cookie.join("") );
};
responseCookies.prototype.clear = function( name, options ) {
    options = options || {};
    options.expires = new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 );
    this.set( name, "", options );
  };
