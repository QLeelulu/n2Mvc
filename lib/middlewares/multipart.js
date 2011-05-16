/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var formidable = require('../refLib/node-formidable');

exports.beginMvcHandler = function(ctx, fnNext){
    var contentType = ctx.req.headers['content-type'] || ctx.req.headers['Content-Type'],
        httpMethod = ctx.req.method && ctx.req.method.toLowerCase();
    
    if ( (httpMethod === 'post' || httpMethod === 'put' ) 
         && contentType 
         && /multipart\/form-data/.test(contentType) )
    {
        var form = new formidable.IncomingForm();
        form.parse(ctx.req, function(err, fields, files){
            if(!err){
                ctx.req.post = fields;
                ctx.req.files = files;
            }
            fnNext();
        });
    }else{
        fnNext();
    }
};

//var multipart = require('../refLib/multipart-js/lib/multipart');
//
//exports.beginMvcHandler = function(ctx, fnNext){
//    var contentType = ctx.req.headers['content-type'] || ctx.req.headers['Content-Type'];
//    if (contentType && /multipart\/form-data/.test(contentType)) {
//      
//      var currentPart;
//      var parser = multipart.parser();
//      parser.headers = ctx.req.headers;
//      ctx.req.files = ctx.req.files || {};
//      ctx.req.post = ctx.req.post || {};
//      parser.onPartBegin = function(part) {
//        currentPart = {
//          name: part.name,
//          filename: part.filename,
//          data: ''
//        };
//      };
//      parser.onPartEnd = function(part) {
//        if (part) {
//          if (currentPart.filename) {
//            ctx.req.files[currentPart.name] = currentPart;
//          } else {
//            ctx.req.post[currentPart.name] = currentPart.data;
//          }
//        }
//      };
//      parser.onData = function(data) {
//        // todo: write to tmp file, rather than buffering
//        currentPart.data += data;
//      };
//      ctx.req.addListener('data', function(chunk) {
//          parser.write(chunk);
//      });
//      ctx.req.addListener('end', function() {
//        parser.close();
//        fnNext();
//      });
//    }else{
//        fnNext();
//    }
//    
//};

