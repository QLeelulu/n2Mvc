/**
 * @author qleelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

this.ViewEngine = {
    render: function(filename, context, callbackFn){
        try{
            var output = Settings.viewEngine.renderView(filename, context, callbackFn);
            // TODO: change to async file read
            //callbackFn(output);
        }catch(err){
            context.res.errorHandler(context.req, context.res, err);
        }
    }
};

/*

//以下为增加的代码

var path = require("path"),
    fs = require('fs');
    
//模板缓存，缓存解析后的模板
Shotenjin.templateCatch = {};
//读取模板内容
//在模板中引用模板使用： {# ../layout.html #}
Shotenjin.getTemplateStr = function(filename){
    //console.log('get template:' + filename);
    var t = '';
    //这里使用的是同步读取
    if(path.existsSync(filename)){
        t = fs.readFileSync(filename, 'utf-8');
    }else{
        throw 'View: ' + filename + ' not exists';
    }
    t = t.replace(/\{#[\s]*([\.\/\w\-]+)[\s]*#\}/ig, function(m, g1) {
    	var fp = path.join(filename, g1.trim())
    	return Shotenjin.getTemplateStr(fp);
    });
    return t;
};

Shotenjin.renderView = function(viewPath, context) {
    var template = Shotenjin.templateCatch[viewPath];
    if(!template){
        var template_str = Shotenjin.getTemplateStr(viewPath);
    	var template = new Shotenjin.Template();
    	template.convert(template_str);
    	//添加到缓存中
    	if(!Settings.DEBUG){
    	    Shotenjin.templateCatch[viewPath] = template;
    	}
    }
	var output = template.render(context);
	return output;
};

this.Shotenjin = Shotenjin;
*/