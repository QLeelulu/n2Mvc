/**
 * @author qleelulu
 * @blog http://qleelulu.cnblogs.com
 */

require('./refLib/shotenjin');
var http = require('http'),
    url = require("url"),
    path = require("path"),  
    fs = require("fs"),
    querystring = require("querystring"),
    
    config = require('./config'),
    route = require('./route');

exports.runServer = function(port){
    port = port || 8080;
    var server = http.createServer(function(req, res){
        var _postData = '';
        //on用于添加一个监听函数到一个特定的事件
        req.on('data', function(chunk)
    	{
    	    _postData += chunk;
    	})
    	.on('end', function()
    	{
            req.post = querystring.parse(_postData);
    	    handlerRequest(req, res);
    	});
        
    }).listen(port, '0.0.0.0');
    
    console.log('Server running at http://127.0.0.1:'+ port +'/');
};

/**
 * 所有请求的统一入口
 */
var handlerRequest = function(req, res){
    //通过route来获取controller和action信息
    var actionInfo = route.getActionInfo(req.url, req.method);
    //如果route中有匹配的action，则分发给对应的action
    if(actionInfo.action){
        //假设controller都放到当前目录的controllers目录里面，还记得require是怎么搜索module的么？
        var controller = require('./controllers/'+actionInfo.controller); // ./controllers/blog
        if(controller[actionInfo.action]){
            var ct = new controllerContext(req, res);
            //动态调用，动态语言就是方便啊
            //通过apply将controller的上下文对象传递给action
            controller[actionInfo.action].apply(ct, actionInfo.args);
        }else{
            handler500(req, res, 'Error: controller "' + actionInfo.controller + '" without action "' + actionInfo.action + '"')
        }
    }else{
        //如果route没有匹配到，则当作静态文件处理
        staticFileServer(req, res);
    }
};

//controller的上下文对象
var controllerContext = function(req, res){
    this.req = req;
    this.res = res;
    this.handler404 = handler404;
    this.handler500 = handler500;
};
controllerContext.prototype.render = function(viewName, context){
    viewEngine.render(this.req, this.res, viewName, context);
};
controllerContext.prototype.renderJson = function(json){
    viewEngine.renderJson(this.req, this.res, json);
};

//如果有未处理的异常抛出，可以在这里捕获到
//process.on('uncaughtException', function (err) {
//    console.log(err);
//});

var handler404 = function(req, res){
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Page Not Found');
};

var handler500 = function(req, res, err){
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err);
};

var viewEngine = {
    render: function(req, res, viewName, context){
        var filename = path.join(__dirname, 'views', viewName);
        try{
            var output = Shotenjin.renderView(filename, context);
        }catch(err){
            handler500(req, res, err);
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(output);
    },
    renderJson: function(res, obj){
    	res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(JSON.stringfly(obj));
    }
};

var staticFileServer = function(req, res, filePath){
    if(!filePath){
        filePath = path.join(__dirname, config.staticFileDir, url.parse(req.url).pathname);
    }
    path.exists(filePath, function(exists) {  
        if(!exists) {  
            handler404(req, res);  
            return;  
        }  
  
        fs.readFile(filePath, "binary", function(err, file) {  
            if(err) {  
                handler500(req, res, err);
                return;  
            }
            
            var ext = path.extname(filePath);
            ext = ext ? ext.slice(1) : 'html';
            res.writeHead(200, {'Content-Type': contentTypes[ext] || 'text/html'});
            res.write(file, "binary");
            res.end();
        });  
    });
};
var contentTypes = {
  "aiff": "audio/x-aiff",
  "arj": "application/x-arj-compressed",
  "asf": "video/x-ms-asf",
  "asx": "video/x-ms-asx",
  "au": "audio/ulaw",
  "avi": "video/x-msvideo",
  "bcpio": "application/x-bcpio",
  "ccad": "application/clariscad",
  "cod": "application/vnd.rim.cod",
  "com": "application/x-msdos-program",
  "cpio": "application/x-cpio",
  "cpt": "application/mac-compactpro",
  "csh": "application/x-csh",
  "css": "text/css",
  "deb": "application/x-debian-package",
  "dl": "video/dl",
  "doc": "application/msword",
  "drw": "application/drafting",
  "dvi": "application/x-dvi",
  "dwg": "application/acad",
  "dxf": "application/dxf",
  "dxr": "application/x-director",
  "etx": "text/x-setext",
  "ez": "application/andrew-inset",
  "fli": "video/x-fli",
  "flv": "video/x-flv",
  "gif": "image/gif",
  "gl": "video/gl",
  "gtar": "application/x-gtar",
  "gz": "application/x-gzip",
  "hdf": "application/x-hdf",
  "hqx": "application/mac-binhex40",
  "html": "text/html",
  "ice": "x-conference/x-cooltalk",
  "ief": "image/ief",
  "igs": "model/iges",
  "ips": "application/x-ipscript",
  "ipx": "application/x-ipix",
  "jad": "text/vnd.sun.j2me.app-descriptor",
  "jar": "application/java-archive",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "latex": "application/x-latex",
  "lsp": "application/x-lisp",
  "lzh": "application/octet-stream",
  "m": "text/plain",
  "m3u": "audio/x-mpegurl",
  "man": "application/x-troff-man",
  "me": "application/x-troff-me",
  "midi": "audio/midi",
  "mif": "application/x-mif",
  "mime": "www/mime",
  "movie": "video/x-sgi-movie",
  "mp4": "video/mp4",
  "mpg": "video/mpeg",
  "mpga": "audio/mpeg",
  "ms": "application/x-troff-ms",
  "nc": "application/x-netcdf",
  "oda": "application/oda",
  "ogm": "application/ogg",
  "pbm": "image/x-portable-bitmap",
  "pdf": "application/pdf",
  "pgm": "image/x-portable-graymap",
  "pgn": "application/x-chess-pgn",
  "pgp": "application/pgp",
  "pm": "application/x-perl",
  "png": "image/png",
  "pnm": "image/x-portable-anymap",
  "ppm": "image/x-portable-pixmap",
  "ppz": "application/vnd.ms-powerpoint",
  "pre": "application/x-freelance",
  "prt": "application/pro_eng",
  "ps": "application/postscript",
  "qt": "video/quicktime",
  "ra": "audio/x-realaudio",
  "rar": "application/x-rar-compressed",
  "ras": "image/x-cmu-raster",
  "rgb": "image/x-rgb",
  "rm": "audio/x-pn-realaudio",
  "rpm": "audio/x-pn-realaudio-plugin",
  "rtf": "text/rtf",
  "rtx": "text/richtext",
  "scm": "application/x-lotusscreencam",
  "set": "application/set",
  "sgml": "text/sgml",
  "sh": "application/x-sh",
  "shar": "application/x-shar",
  "silo": "model/mesh",
  "sit": "application/x-stuffit",
  "skt": "application/x-koan",
  "smil": "application/smil",
  "snd": "audio/basic",
  "sol": "application/solids",
  "spl": "application/x-futuresplash",
  "src": "application/x-wais-source",
  "stl": "application/SLA",
  "stp": "application/STEP",
  "sv4cpio": "application/x-sv4cpio",
  "sv4crc": "application/x-sv4crc",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tar": "application/x-tar",
  "tcl": "application/x-tcl",
  "tex": "application/x-tex",
  "texinfo": "application/x-texinfo",
  "tgz": "application/x-tar-gz",
  "tiff": "image/tiff",
  "tr": "application/x-troff",
  "tsi": "audio/TSP-audio",
  "tsp": "application/dsptype",
  "tsv": "text/tab-separated-values",
  "txt": "text/plain",
  "unv": "application/i-deas",
  "ustar": "application/x-ustar",
  "vcd": "application/x-cdlink",
  "vda": "application/vda",
  "vivo": "video/vnd.vivo",
  "vrm": "x-world/x-vrml",
  "wav": "audio/x-wav",
  "wax": "audio/x-ms-wax",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "wmx": "video/x-ms-wmx",
  "wrl": "model/vrml",
  "wvx": "video/x-ms-wvx",
  "xbm": "image/x-xbitmap",
  "xlw": "application/vnd.ms-excel",
  "xml": "text/xml",
  "xpm": "image/x-xpixmap",
  "xwd": "image/x-xwindowdump",
  "xyz": "chemical/x-pdb",
  "zip": "application/zip"
};
