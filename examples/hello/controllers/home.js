/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var fs = require('fs');

var myFilter = function(target){
    this.target = target;
    
    this.onControllerExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onControllerExecuting \r\n<br/>');
        fnNext();
    };
    this.onControllerExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onControllerExecuted \r\n<br/>');
        fnNext();
    };
    this.onActionExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onActionExecuting \r\n<br/>');
        fnNext();
    };
    this.onActionExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onActionExecuted \r\n<br/>');
        fnNext();
    };
    this.onResultExecuting = function(ctx, fnNext){
        ctx.res.write(this.target + ': onResultExecuting \r\n<br/>');
        fnNext();
    };
    this.onResultExecuted = function(ctx, fnNext){
        ctx.res.write(this.target + ': onResultExecuted \r\n<br/>');
        fnNext();
    };
};

this.filters = [
    new myFilter('homeController'), new myFilter('homeController2')
];

exports.index = function(fnNext){
    this.res.cookies.clear('name');
    fnNext( this.ar.view({msg: 'hello world'}) );
};
exports.index.filters = [
    new myFilter('indexAction'), new myFilter('indexAction2')
];

exports.index_post = function(fnNext){
    //console.dir(this.req)
    if(this.req.files && this.req.files.testfile){
        console.log(this.req.files.testfile.path)
        console.log('/home/qleelulu/bak/'+this.req.files.testfile.filename)
        fs.rename(this.req.files.testfile.path, 
                  '/home/qleelulu/bak/'+this.req.files.testfile.filename)
        //fs.writeFileSync('/home/qleelulu/bak/'+this.req.files.testfile.filename, 
        //                 this.req.files.testfile.data, 
        //                 'binary');
    }
    fnNext( this.ar.view({msg: 'hello world -> post<br/>'}) );
};

exports.json = function(fnNext){
    fnNext( this.ar.json({msg: 'hello world'}) );
};



/**************************
 * tweets demo
 */
var http = require('http'),
    events = require("events");

var tsina_client = http.createClient(80, "api.t.sina.com.cn");

//创建一个EventEmitter的实例
var tweets_emitter = new events.EventEmitter();

function get_tweets() {
	var request = tsina_client.request("GET", "/statuses/public_timeline.json?source=3243248798", {"host": "api.t.sina.com.cn"});

	request.addListener("response", function(response) {
		var body = "";
		response.addListener("data", function(data) {
			body += data;
		});

		response.addListener("end", function() {
			var tweets = JSON.parse(body);
			if(tweets.length > 0) {
			    //这里发出事件调用
				tweets_emitter.emit("tweets", tweets);
			}
		});
	});

	request.end();
};

// action: tweets
exports.tweets = function(fnNext){
    fnNext( this.ar.view() );
};

// action: tweets_data
exports.tweets_data = function(fnNext){
    var _t = this;
    //注册一个一次性的事件监听
    var listener = tweets_emitter.once("tweets", function(tweets) {  
        fnNext( _t.ar.view({tweets: tweets}) );
    });
  
    get_tweets();
};