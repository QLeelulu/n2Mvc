/*
 * $Rev: 39 $
 * $Release: 0.0.0 $
 * $Copyright$
 * License:  MIT License
 */

/**
 *  namespace
 */

var nTenjin = {

	version: '0.1.1',	

	_escape_table: { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' },

	_escape_func: function(m) { return nTenjin._escape_table[m]; },

	escapeXml: function(s) {
		//if (s == null) return '';
		return typeof(s) != 'string' ? s : s.replace(/[&<>"]/g, nTenjin._escape_func); //"
		//return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); //"
	},

	escapeXml2: function(s) {
		if (s == null) return '';
		return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');  //"
	},

	strip: function(s) {
		if (! s) return s;
		//return s.replace(/^\s+|\s+$/g, '');
		return s.replace(/^\s+/, '').replace(/\s+$/, '');
	},

	_end: undefined  // dummy property to escape strict warning (not legal in ECMA-262)
};
delete(nTenjin._end);

// 因为用 new Function 创建的函数，其[[scope]]的作用域链只包含全局对象，所以这里定义为全局变量
_nTenjinEscapeXml = nTenjin.escapeXml;

/**
 *  Template class
 */

nTenjin.Template = function(properties) {
	if (properties) {
		var p = properties;
		if (p['escaefunc']) this.escapefunc = p['escapefunc'];
	}
};

nTenjin.Template.prototype = {

	escapefunc: '_nTenjinEscapeXml',

	convert: function(input) {
		var buf = [];
		buf.push("var _buf='';");
		this.parseStatements(buf, input);
		buf.push("return _buf;");
		buf = buf.join('').split("_buf+='';").join('')
			 .split("var _buf='';_buf+=").join('var _buf=');
        try {
			return this.render = new Function('it', buf);
            //eval('this.render = function(it){' + buf + '};');
            //return this.render;
		} catch (e) {
			if (typeof console !== 'undefined') console.log("Could not create a template function: " + buf);
			throw e;
		}
	},

	parseStatements: function(buf, input) {
		var regexp = /<\?js(\s(.|\n)*?) ?\?>/mg;
		var pos = 0;
		var m;
		while ((m = regexp.exec(input)) != null) {
			var stmt = m[1];
			var text = input.substring(pos, m.index);
			pos = m.index + m[0].length;
			//
			if (text) this.parseExpressions(buf, text);
			if (stmt) buf.push(stmt);
		}
		var rest = pos == 0 ? input : input.substring(pos);
		this.parseExpressions(buf, rest);
	},

	parseExpressions: function(buf, input) {
		if (! input) return;
		//buf.push(" _buf+=");
		var regexp = /([$#])\{(.*?)\}/g;
		var pos = 0;
		var m;
		while ((m = regexp.exec(input)) != null) {
			var text = input.substring(pos, m.index);
			var s = m[0];
			pos = m.index + s.length;
			this.addText(buf, text);
			buf.push(";_buf+=");
			var indicator = m[1];
			var expr = m[2];
			if (indicator == "$")
				buf.push(this.escapefunc, "(", expr, ");");
			else
				buf.push(expr, ";");
		}
		var rest = pos == 0 ? input : input.substring(pos);
		rest ? this.addText(buf, rest, true) : buf.push('""');
		buf.push(";");
		if (input.charAt(input.length-1) == "\n")
			buf.push("\n");
	},

	addText: function(buf, text, encode_newline) {
		if (! text) return;
		var s = text.replace(/[\'\\]/g, '\\$&').replace(/\n/g, '\\n\\\n');
		buf.push("_buf+='", s, "'");
	},

	_end: undefined  // dummy property to escape strict warning (not legal in ECMA-262)
};
delete(nTenjin.Template.prototype._end);


/*
 *  convenient function
 */
nTenjin.render = function(template_str, context) {
	var template = new nTenjin.Template();
	template.convert(template_str);
	var output = template.render(context);
	return output;
};

/**
 * compile str to Function
 * 
 * @param {String} str, template string
 * @return {Function}
 * @api public
 */

nTenjin.compile = function(str, options) {
	var tpl = new nTenjin.Template();
	return tpl.convert(str);
};

/*
 *  node.js
 */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = nTenjin;
}


//以下为增加的代码

var path = require("path"),
    fs = require('fs');
    
//模板缓存，缓存解析后的模板
nTenjin.templateCatch = {};
//读取模板内容
//在模板中引用模板使用： {# ../layout.html #}
nTenjin.getTemplateStr = function(filename){
    //console.log('get template:' + filename);
    var t = '';
    //这里使用的是同步读取
    if(path.existsSync(filename)){
        t = fs.readFileSync(filename, 'utf-8');
    }else{
        throw 'View: ' + filename + ' not exists';
    }
    t = t.replace(/\{#[\s]*([\.\/\w\-]+)[\s]*#\}/ig, function(m, g1) {
    	var fp = path.join(filename, '../', g1.trim())
    	return nTenjin.getTemplateStr(fp);
    });
    return t;
};

nTenjin.renderView = function(viewPath, context, fn) {
    var template = nTenjin.templateCatch[viewPath];
    if(!template){
        var template_str = nTenjin.getTemplateStr(viewPath);
    	var template = new nTenjin.Template();
    	template.convert(template_str);
    	//添加到缓存中
    	if(!Settings.DEBUG){
    	    nTenjin.templateCatch[viewPath] = template;
    	}
    }
	var output = template.render(context);
	fn(output);
};

global.nTenjin = nTenjin;
