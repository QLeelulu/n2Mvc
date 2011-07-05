/**
 * @author qleelulu
 * @blog http://qleelulu.cnblogs.com
 */

var util = require("util");
var utilities = require('./util/utilities');

exports.newForm = function(fields){
    var _new = function(formData){
        FormBase.call(this, formData);
    };
    util.inherits(_new, FormBase);
    _new.fields = fields;
    return _new;
};

exports.FormBase = FormBase = function(formData){
    this.validErrors = {};
    this.init(formData);
};

FormBase.prototype.init = function(formData){
    if(!formData){ return; }
    for(var k in this.constructor.fields){
        this[k] = formData[k];
    }
};

/******************************
 * validater name plaese don't named it end with '_msg'
 */
FormBase.prototype.isValid = function(){
    var isValid = true, field = null, r = null;
    for(var fieldName in this.constructor.fields){
        field = this.constructor.fields[ fieldName ];
        for(var ruleName in field){
            if(ruleName.search('_msg$')>0){
                continue;
            }
            if( !Validaters[ruleName] ){
                console.log('Validaters do not have the validater named "' + ruleName + '"');
                continue;
            }
            if(ruleName === 'equalto'){
                r = Validaters[ruleName](this[fieldName], this[field[ruleName]]);
            }else{
                r = Validaters[ruleName](this[fieldName], field[ruleName]);
            }
            if(r[1]){
                this[fieldName] = r[0];
            }else{
                isValid = false;
                this.validErrors[fieldName] = field[ruleName + '_msg'] || DefaultMsg[ruleName + '_msg'] || 'Not validate';
                break;
            }
        }
    }
    return isValid;     
};

FormBase.prototype.fieldDatas = function(){
    var r = {};
    for(var fieldName in this.constructor.fields){
        if(this[fieldName] !== undefined){
            r[fieldName] = this[fieldName];
        }
    }
    return r;
};

/*****************
 * build in validaters
 * @return: type {Array}, [value, isOk]
 */
exports.Validaters = Validaters = {
    /*******
     * 正则表达式
     * @re 正则对象
     */
    re: function(v, re){
        return [v, re.test(v)];
    },
    required: function(v, isRequired){
        if(utilities.isString(v)){
            v = v.trim();
        }
        return [v, !isRequired || !!v];
    },
    number: function(v, isNum){
        if(isNum){
            v = Number(v);
        }
        return [v, isNum && !isNaN(v)];
    },
    min: function(v, min){
        v = Number(v);
        return [v, v >= min];
    },
    max: function(v, max){
        v = Number(v);
        return [v, v <= max];
    },
    // num range
    range: function(v, param){
        v = Number(v);
        return [v, v >= param[0] && v <= param[1]];
    },
    minLength: function(v, min){
        v = v.trim();
        return [v, v.length >= min];
    },
    maxLength: function(v, max){
        v = v.trim();
        return [v, v.length <= max];
    },
    // string length range
    rangeLength: function(v, param){
        v = v.trim();
        return [v, v.length >= param[0] && v.length <= param[1]];
    },
    equalto: function(v, v2){
        return [v, v===v2];
    },
    email: function(v, isEmail){
        return [v, (isEmail !== true) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v) ];
    }
};

var DefaultMsg = {
    required_msg: '该字段为必填字段'
};
