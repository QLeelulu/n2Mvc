/*
 * $Rev: 39 $
 * $Release: 0.0.3 $
 * Copyright(c) 2007-2008 kuwata-lab.com all rights reserved
 * License:  MIT License
 */
 

/**
 *  namespace
 */

var Shotenjin = {

	_escape_table: { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' },

	_escape_func: function(m) { return Shotenjin._escape_table[m] },

	escapeXml: function(s) {
		//if (s == null) return '';
		return typeof(s) != 'string' ? s : s.replace(/[&<>"]/g, Shotenjin._escape_func); //"
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

	// ex. {x: 10, y: 'foo'}
	//       => "var x = _context['x'];\nvar y = _conntext['y'];\n"
	_setlocalvarscode: function(obj) {
		var buf = [];
		for (var p in obj) {
			buf.push("var ", p, " = _context['", p, "'];\n");
		}
		return buf.join('');
	},
	
	_end: undefined  // dummy property to escape strict warning (not legal in ECMA-262)
};
delete(Shotenjin._end);

var escapeXml = Shotenjin.escapeXml;


/**
 *  Template class
 */

Shotenjin.Template = function(properties) {
	if (properties) {
		var p = properties;
		if (p['escaefunc']) this.escapefunc = p['escapefunc'];
	}
};

Shotenjin.Template.prototype = {

	escapefunc: 'escapeXml',

	program: null,

	convert: function(input) {
		var buf = [];
		buf.push("var _buf = []; ");
		this.parseStatements(buf, input);
		buf.push("_buf.join('')\n");
		return this.program = buf.join('');
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
		buf.push(" _buf.push(");
		var regexp = /([$#])\{(.*?)\}/g;
		var pos = 0;
		var m;
		while ((m = regexp.exec(input)) != null) {
			var text = input.substring(pos, m.index);
			var s = m[0];
			pos = m.index + s.length;
			this.addText(buf, text);
			buf.push(", ");
			var indicator = m[1];
			var expr = m[2];
			if (indicator == "$")
				buf.push(this.escapefunc, "(", expr, "), ");
			else
				buf.push(expr, ", ");
		}
		var rest = pos == 0 ? input : input.substring(pos);
		rest ? this.addText(buf, rest, true) : buf.push('""');
		buf.push(");");
		if (input.charAt(input.length-1) == "\n")
			buf.push("\n");
	},

	addText: function(buf, text, encode_newline) {
		if (! text) return;
		var s = text.replace(/[\'\\]/g, '\\$&').replace(/\n/g, '\\n\\\n');
		buf.push("'", s, "'");
	},

	render: function(_context) {
		if (_context) {
			eval(Shotenjin._setlocalvarscode(_context));
		}
		else {
			_context = {};
		}
		return eval(this.program);
	},

	_end: undefined  // dummy property to escape strict warning (not legal in ECMA-262)
};
delete(Shotenjin.Template.prototype._end);


/*
 *  convenient function
 */
Shotenjin.render = function(template_str, context) {
	var template = new Shotenjin.Template();
	template.convert(template_str);
	var output = template.render(context);
	return output;
};

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
    	Shotenjin.templateCatch[viewPath] = template;
    }
	var output = template.render(context);
	return output;
};

global.Shotenjin = Shotenjin;
