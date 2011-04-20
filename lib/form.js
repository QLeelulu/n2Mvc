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
            r = Validaters[ruleName](this[fieldName], field[ruleName]);
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
        if(this[fieldName]){
            r[fieldName] = this[fieldName];
        }
    }
    return r;
};

/*****************
 * build in validaters
 * @return: type list, [value, isOk]
 */
exports.Validaters = Validaters = {
    required: function(v, isRequired){
        if(utilities.isString(v)){
            v = v.trim();
        }
        return [v, !isRequired || !!v];
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
    }
};

var DefaultMsg = {
    required_msg: '该字段为必填字段'
};
