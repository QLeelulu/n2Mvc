/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


this.extend = function(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
};


this.keys = function(object) {
    var keys = [];
    for (var property in object)
        keys.push(property);
    return keys;
};

this.isFunction = function(object) {
    return typeof object == "function";
};

this.isUndefined = function(object) {
    return typeof object == "undefined";
};
