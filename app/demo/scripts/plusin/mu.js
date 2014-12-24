/**
 * mizi utils
 * 米子的工具类库
 * @ -> 向 Underscore 致敬
 * @ -> 不考虑 ie8 以下版本
 *
 * * AOC: array * collection * object
 * * T: 泛型，所有类型
 */
(function(window, undefined){

'use strict';
// 创建闭包全局
var root = this;

// 创建对象式的调用方式， 返回一个包装器
// 包装器对象中包含所有的 mu 方法
// mu 为一个函数对象，实例服从单例模式
var mu = function(obj){
    return mu[obj];
};

// 创建内部私有替代器
var $$ = mu;

mu.VERSION = '1.5.0';

/**
 * -------------------------
 * 基础方法以及常用方法 base
 * -------------------------
 */

/**
 * mu.args(Arguments args)
 * 将 Arguments 转为一个数组
 * @param args
 * @returns {Array.<T>}
 */
mu.args = function(/**Arguments*/args){
    return Array.prototype.slice.call( args, 0 );
};

/**
 * mu.noop();
 * 空函数
 */
mu.noop = function(){};

/**
 * 简单的闭包调用以及条件判断的简写
 * mu.run(fn)
 * mu.run(boolean, fn)
 * mu.run(boolean, fn, fn1)
 * @param condition
 * @param truefn
 * @param falsefn
 * @returns {*}
 */

/** exp.
    mu.run(fn) --> (function(){})();
    mu.run(boolean, fn) --> boolean && truefn();
    mu.run(boolean, fn, fn1) --> boolean ? truefn() : falsefn() ;
*/
mu.run = function (/**Bool*/condition, /**Fn*/truefn, /**Fn*/falsefn) {
    var arg = $$.args(arguments);

    if( arg[0] == null ){
        return null;
    }

    if(typeof arg[0] === 'function'){
        return arg[0]();
    }

    condition = arg[0];
    truefn = arg[1] || $$.noop;
    falsefn = arg[2] || $$.noop;

    return condition ? truefn() : falsefn();
};

/**
 * mu.type(T t)
 * 获得当前参数的类型
 * mu.type(T t, String type)
 * 判断当前参数的类型是否为指定类型
 * @param T
 * @param type
 * @returns {*}
 */

/** exp.
 mu.type([]) =-> "array"
 mu.type([], "array") =-> true
 */
mu.type = function(/**T*/ t, /**String*/type ){
    var tc = { // type class
        //原生判断
        "null": "null",
        "undefined": "undefined",
        "NaN": "nan",
        "Infinity": "infinity",
        //typeof 判断
        "string": "string",
        "number": "number",
        "function": "function",
        "boolean": "boolean",
        //prototype.toString 判断
        "[object RegExp]": "regexp",
        "[object Array]": "array",
        "[object Date]" : "date",
        "[object Arguments]" : "arguments",
        "[object HTMLCollection]": "nodelist", // chrome, ie9+
        "[object NodeList]": "nodelist",
        "[object XMLDOMNodeList]": "document",
        "[object global]":"window", //Chrome
        "[object Window]":"window", //ie9 +
        "[object DOMWindow]": "window", //safari 5.1.7
        "[object HTMLDocument]": "document"
    }, rst = tc[ t ];

    if( !rst ){
        rst = tc[ typeof t ];
        if( !rst ){
            var tt = Object.prototype.toString.apply( t );
            rst = tc[ tt ];
            if( !rst ){ //document && element
                rst = t.nodeName ? ( t.nodeName == "#document" ? "document" : "element" ) : false;
                if( !rst ) {
                    rst = ( t == t.document && t.document != t ) ? "window" //IE6，7，8 下 window == document => true, document == window  => false
                        : t.nodeType == 9 ? "document"
                        : t.callee ? "arguments"
                        : isFinite( t.length ) && t.item ? "nodelist"
                        : tt.slice( 8, -1 ).toLowerCase();
                }
            }
        }
    }

    return type ? rst === type.toLowerCase() : rst;
};

/**
 * mu.dat(T dat, T ...t)
 * 若 dat 为fn 的时候，参数为 t， 若非 fn 则直接返回
 * @param dat
 * @param t
 * @returns {T}
 */

/** exp.
    mu.dat('This is a  default value', 1, 2, 3 ) =-> "This is a  default value";
    mu.dat(function(a, b, c){
        reutrn a*b*c;
    }, 1, 2, 3) --> 6;
 */
mu.dat = function(/**T*/dat, /**T*/ t){
    if(typeof dat !== 'function'){
        return dat;
    }

    var args = $$.args(arguments);
    dat = args.shift();
    return dat.apply(window, args);
};

/**
 * mu.empty(T t)
 * 判断任意t，是否为空
 * 空： 不存在，长度为0，无属性值，
 * @param t
 * @returns {boolean}
 */
    /** exp.
        mu.empty([]) =-> true
        mu.empty(0) =-> true
        mu.empty({}) =-> true
     */

mu.empty = function(/**T*/ t){
    if(t == null) {
        return true;
    }

    if( t.length == + t.length ){
        return t.length === 0;
    }

    if( t == + t ){
        return t  === 0;
    }

    for(var key in t) if(t.hasOwnProperty(key)) {
        return false;
    }

    return true;
};

/**
 * mu.exist(T t)
 * 判断任意对象是否存在
 * @param t
 * @returns {boolean}
 */
mu.exist = function(/**T*/ t){
    return t == null;
};

/**
 * mu.ifnull(T t, T nullVal, T existVal)
 * 若 t = null || undefined, 则返回 nullVal; 若不为null 则返回 existVal;
 * @param t
 * @param nullVal
 * @param existVal
 * @returns {*}
 */

/** exp.
    mu.ifnull(null,"123") =-> "123";
    mu.ifnull(null, function(){
        return "123"
    }) =-> "123";
    mu.ifnull(123, 1234, function(a){
        return a*2;
    }) =-> 246;
 */
mu.ifnull = function(/**T*/t, /**T*/nullVal, /**T*/ existVal){
    return $$.exist(t) ? $$.dat(nullVal) : $$.dat(existVal, t) || t;
};

/**
 * mu.ifempty(T t, T emptyVal, T existVal)
 * 若 t = empty, 则返回 nullVal; 若不为null 则返回 existVal;
 * @param t
 * @param emptyVal
 * @param existVal
 * @returns {*}
 */
mu.ifempty = function(/**T*/t, /**T*/emptyVal, /**T*/existVal){
    return $$.empty(t) ? $$.dat(emptyVal) : $$.dat(existVal, t) || t;
};

/**
 * ---------------------------
 * 数据和集合（对象） collection
 * ---------------------------
 */

/**
 * mu.each(Aoc aoc, Fn fn[, Obj scope])
 * 遍历数据对象或集合
 * @param aoc
 * @param fn
 * @param scope
 */
mu.each = function(/**AOC*/aoc, /**Fn*/fn, /**Obj*/scope){
    // 不处理空值
    if(aoc == null){
        return;
    }

    // 鸭式判断数组（字符串）aoc.length === + aoc.length
    if(aoc.length === + aoc.length){
        for(var i = 0, l = aoc.length; i < l; i ++){
            if(fn.call(scope, aoc[i], i, aoc) != null){
                return;
            }
        }
    // 对象，集合
    }else{
        for(var key in aoc){
            if(aoc.hasOwnProperty(key)){
                if(fn.call(scope, aoc[key], key, aoc) != null){
                    break;
                }
            }
        }
    }
};

/**
 * mu.map(Aoc aoc, Function fn[, String type, Obj scope])
 * 匹配，将符合fn条件的item集合成一个新的数组或对象
 * @param aoc 对象或集合
 * @param fn 条件函数
 * @param scope 作用域
 * @param type 返回类型 || "array"
 * @returns {Array}
 *
 * @extend mu.each;
 */

/** exp.
     mu.map([1,2,3],function(v,k){return v*2;}) =-> [2,4,6]
     mu.map([1,2,3],function(v,k){return v*2;}, "object") =-> {0: 2, 1: 4, 2: 6}

     // 将JSON的key与val对调
     mu.map({"id": 12345, 'no': 'card'}, function(v, k){
        return {
            "__key__": v,
            "__val__": k
        }
     }, "object")  =-> {12345: "id", card: "no"}
 */
mu.map = function(/**AOC*/aoc, /**Fn*/fn, /**String*/type, /**Obj*/scope){
    var arg = $$.args(arguments);

    if(arg[0] == null){
        return;
    }

    if(arg[1] == null){
        return arg[0];
    }

    if(typeof arg[2] !== "string"){
        type = "array";
        scope = arg[2];
    }

    if(type !=="object"){
        type = "array";
    }

    var rst = type === "array" ? [] : {};

    mu.each(aoc, function(v, k, aoc){
        var cb = fn.call(scope, v, k, aoc);
        if(cb != null ){
            if(type === "object"){
                var val = cb.__val__;
                val = val === undefined ? undefined : val === null ? cb : val;
                rst[ cb.__key__ || k ] = val;
            }else{
                rst[rst.length] = cb;
            }
        }
    }, scope);

    return rst;
};

/**
 * mu.clone(T t)
 * 浅拷贝
 * @param t
 * @returns {*}
 */
mu.clone = function(/**T*/ t){
    if(typeof t != "object"){
        return t;
    }

    if(t.length === +t.lenght ){
        return t.silce();
    }

    return $$.extend({}, t);
};

/**
 * mu.newly(T t)
 * 根据不同的类型，生成空对象
 * @param t
 * @returns {*}
 */
mu.newly = function(/**T*/ t){
    switch ($$.type(t)){
        case "array":
            return [];
        case "string":
            return "";
        case "date":
            return new Date();
        default:
            return {};
    }
};

/**
 * mu.find(AOC aoc, Function fn, Object scope)
 * 在集合中按条件搜索，返回第一个匹配条件
 * @param aoc
 * @param fn
 * @param scope
 * @returns {Array || Object}
 */
mu.find = mu.one = function(/*AOC*/aoc, /*Function*/ fn, /**Object*/ scope){
    var i, val;
    var isArray = $$.type(aoc, 'array'),
        rst = isArray ? [] : {};
    for(i in aoc) if( aoc.hasOwnProperty(i)) {
        val = aoc[i];
        if(fn.call(scope, val, i, aoc)){
            rst = mu.push(rst, val, isArray ? 0 : i);
            return rst;
        }
    }
};

/**
 * mu.filter(AOC aoc, Function fn, Object scope)
 * 在集合中按条件搜索，返回所有匹配条件
 * @param aoc
 * @param fn(val, key, aoc)
 * @param scope
 * @returns {Array || Object}
 */
mu.filter = mu.more = function(/*AOC*/aoc, /*Function*/ fn, /**Object*/ scope){
    var i, val;
    var isArray = $$.type(aoc, 'array'),
        rst = isArray ? [] : {};

    $$.each(aoc, function(val, i){
        val = aoc[i];
        if(fn.call(scope, val, i, aoc)){
            rst = mu.push(rst, val, !isArray && i);
        }
    });

    return rst;
};

/**
 * mu.pick(AOC aoc, SI key)
 * 摘出指定项, 若该项不存在则返回 undefined
 * @param aoc
 * @param keys
 * @returns {Array || Object}
 */
mu.pick = function(/**AOC*/ aoc, /**SI...*/ keys){
    var args = $$.args(arguments);
    aoc = args.shift();
    var rst = $$.newly(aoc);
    var isArray = $$.type(aoc, "array");
    $$.each(args, function(v){
        rst = $$.push(rst, aoc[v], !isArray && v);
    });
    return rst;
};

/**
 * mu.pick.except(AOC aoc, SI key)
 * 摘出指定项剩下的项
 * @param aoc
 * @param keys
 * @returns {*}
 */
mu.pick.except = function(/**AOC*/ aoc, /**SI...*/ keys){
    var args = $$.args(arguments);
    aoc = args.shift();
    var rst = $$.newly(aoc);
    var isArray = $$.type(aoc, "array");
    var srcKeys = $$.keys(aoc);
    $$.each(srcKeys, function(v){
        if( $$.indexOf(args,v) ==-1){
            rst = $$.push(rst, aoc[v], !isArray && v);
        }
    });
    return rst;
};

/**
 * -----------------
 * 对象 Object
 * -----------------
 */

/**
 * mu.extend(Object target, Object ...src)
 * 将src的属性覆盖到target上，若有相同的属性，会完全覆盖
 * @param target
 * @param src
 * @returns {Object}
 */
mu.extend = function(/**Obj*/target, /**obj*/src ){
    if(typeof t != "object"){
        return target;
    }

    var args = $$.args(arguments);
    var key;
    for(var i = 0, l = args.length; i<l; i++){
        src = args[i];
        for(key in src){
            if(src.hasOwnProperty(key)){
                target[key] = src[key];
            }
        }
    }

    return target;
};

/**
 * mu.has(Object obj, String key)
 * 判断对象是否有key这个属性
 * @param obj
 * @param key
 * @returns {boolean|*}
 */
mu.has = function(/**Obj*/ obj, /**String*/key){
    return obj != null && hasOwnProperty.call(obj, key);
};

/**
 * mu.keys(Object obj)
 * 获得对象的key的集合，返回一个数组
 *
 * @param obj
 * @return {array}
 * @extend mu.map
 */
mu.keys = function(/**Obj*/ obj){
    return $$.map(obj, function(v,k){
        return k;
    });
};

/**
 * mu.vals(Object obj)
 * 获得对象的值的集合，返回一个数组
 *
 * @param obj
 * @returns {array}
 */
mu.vals = function(/**Obj*/ obj){
    return $$.map(obj, function(v,k){
        return v;
    });
};

/**
 * mu.toggle(Object obj)
 * 将某一特质的对象的key与val对调
 * @param obj
 * @returns {object}
 */

/** exp.
    mu.toggle({"active": 1, "inactive": 0}) =-> {1:"active", 0:"inactive"}
 */
mu.toggle = function(/**Obj*/ obj){
    return $$.map(obj, function(v,k){
        return {
            "__key__": v,
            "__val__": k
        };
    }, "object");
};

/**
 * mu.arr2Json(Array arr)
 * 将数组转为对象面位量
 *
 * @param arr
 * @returns {object}
 */
mu.arr2Json = function(/**Array*/ arr){
    return $$.map(arr, function(v, k){
        return {
            "__key__": k,
            "__val__": v
        };
    }, "object");
};

/**
 * mu.prop(String propStr, Object scope)
 * 获取对象属性值，若中间节点不存在则返回 null
 * @param propStr
 * @param scope
 * @returns {T}
 */

/** exp.
    var user = {
        name: "Mizi Lin",
        city: {
            postcode: "0591",
            name: "福州",
            location: {
                street: "新桥里",
                number: "103号"
            }
        }
    }

    mu.prop("name", user) =-> Mizi Lin (user.name)
    mu.prop("city.location.street", user) => "新桥里"(user.location.street)
    mu.prop("school.class",  user) => null (user.school.class)

    ps.
    user.school.class 其中 school 不存在则 user.school.class 在js中异常，
    则使用mu.prop 返回null
*/
mu.prop = function(/**String*/ propStr, /**Object*/scope){
    if(propStr == null || typeof propStr !== 'string' || propStr.lenght === 0){
        return;
    }
    scope = scope || window;
    var props = propStr.split("."),
        prop = props.shift(),
        rst = scope[prop];
    return rst == null ? null : ( props.length ? $$.prop(props.join('.'), rst) : rst );
};

/**
 * mu.prop.ifnull(String propStr, Object scope, T nullVal[, T existVal])
 * @param propStr
 * @param scope
 * @param nullVal
 * @param existVal
 * @returns {*|Object}
 */
mu.prop.ifnull = function(/**String*/ propStr, /**Obj*/scope, /**T*/ nullVal, /**T*/ existVal){
    var val = $$.prop(propStr, scope);
        val = $$.ifnull(val, nullVal, existVal);
    return $$.touch(propStr, scope, val);
};

/**
 * mu.prop.update(String propStr, Object scope, T val)
 * @param propStr
 * @param scope
 * @param val
 * @returns {*|Object}
 */
mu.prop.update = function(/**String*/ propStr, /**Obj*/scope, /**T*/ val){
    return $$.touch(propStr, scope, val);
};

/**
 * mu.touch(String propStr[, Object scope, T val])
 * 类似linxu 的 touch 功能，若属性链中某条不存在，则创建该链, 并赋值
 * @param propStr
 * @param scope
 * @param val
 * @returns {Object}
 */
mu.touch = function(/**String*/ propStr, /*Object*/scope, /**T*/ val){
    scope = scope || window;
    var nn = function( proStr ){
        var props = propStr.split(".");
        for( var i = 0, l = props.length, prop; i<l; i ++ ){
            prop = props[i];
            scope[prop] = scope[prop] || {};
            if( l - 1 == i ){
                scope[prop] = val;
            }
            scope = scope[prop];
        }
    };

    nn( propStr );

    return scope;
};

/**
 * mu.ns(String ns[, T t])
 * 创建命名空间
 * @param ns
 * @param t
 * @returns {*|Object}
 */
mu.ns = function(/**String*/ ns, /**T*/ t){
    return $$.touch(ns, window, t || {});
};

/**
 * mu.push(AOC aoc, T t, SI key)
 * 给对象或数组 添加/更新项
 * 数组默认添加到最后一项，返回原对象/数组
 * @param aoc
 * @param val
 * @param key
 * @returns {AOC}
 */
mu.push = function(/*AOC*/aoc, /**T*/ val, /**SI*/key){
    if(!key){
        aoc[aoc.length] = val;
    }else{
        aoc[key] = val;
    }
    return aoc;
};

/**
 * -----------------
 * 数组 Array
 * -----------------
 */
/**
 * mu.top(Array arr, T t)
 * 数组添加一项，并置顶
 * @param arr
 * @param t
 * @returns {Array}
 */
mu.top = function(/**Array*/ arr, /**T*/ t){
    arr.unshift(t);
    return arr;
};

/**
 * mu.bottom(Array arr, T t)
 * 数组添加一项，并放在底部
 * @param arr
 * @param t
 * @returns {Array}
 */
mu.bottom =  function(/**Array*/ arr, /**T*/ t){
    return $$.push(arr, t);
};

/**
 *
 * @param arr
 * @param t
 * @param n 所在数组中的索引值 || 0；
 * @returns {Array}
 */
mu.insert = function(/**Array*/ arr, /**T*/ t, /**Int*/ n){
    var l = arr.length;
    n = n > l ? l : n < 0 ? 0 : n || 0;
    arr["splice"](n, 0, t);
    return arr;
};

/**
 * mu.reindex(Array arr)
 * 重建数据库索引，返回一个新数组 (清除数组内无值的项)
 * 无值： undefined, null
 * @param arr
 * @returns {array}
 * @exten mu.map
 */
mu.reindex = function(/**Array*/ arr){
    return $$.map(arr, function(v){
        if( v != null ){
            return v;
        }
    });
};

/**
 * mu.indexOf(Array arr, T item)
 * 返回 item 所处在数组的索引位置
 * @param arr
 * @param fn
 * @param item
 * @returns {number}
 */
mu.indexOf = function(/**Array*/ arr, /**Function*/ fn, /**T*/ item){
    var args = $$.args(arguments);
    var i, l, scope, val;
    if(typeof fn === "function"){
        scope = item;
        for(i in arr) if( arr.hasOwnProperty(i)) {
            val = arr[i];
            if(fn.call(scope, val, i, arr)){
                return i;
            }
        }
    }else{
        item = args[1];
        for(i = 0, l= arr.length; i < l; i++){
            if(arr[i] === item){
                return i;
            }
        }
    }

    return -1;
};

/**
 * mu.first(Array arr[, Int n])
 * 获得数组的前几项，默认返回数组的第一项
 * @param arr
 * @param n 非必填 || 1
 * @returns {array}
 */
mu.first = function(/**Array*/arr, /**Int*/n){
    if(arr == null){
        return;
    }

    if(n <=0 ){
        return [];
    }

    return arr['slice']( 0, n || 1);
};

/**
 * mu.first.except(Array arr[, Int n])
 * 返回数组中除了N个元素外的其他全部元素, 即mu.first后剩下的元素
 * @param arr
 * @param n
 * @returns {array}
 */
mu.first.except = function(/**Array*/arr, /**Int*/n){
    if(arr == null){
        return;
    }

    if(n <=0 ){
        return arr;
    }

    return arr['slice'](n || 1);
};

/**
 * mu.last(Array arr[, Int n])
 * 返回数组中最后N个元素，默认返回最后一个元素
 * @param arr
 * @param n
 * @returns {array}
 */
mu.last = function(/**Array*/arr, /**Int*/n){
    if (arr == null) {
        return;
    }

    if (n <= 0) {
        return [];
    }

    return arr['slice'](Math.max(arr.length -(n || 1), 0))
};

/**
 * mu.last.except(Array arr[, Int n])
 * 返回数组中最后N个元素的剩下元素
 * @param arr
 * @param n
 * @returns {array}
 */
mu.last.except = function(/**Array*/arr, /**Int*/n){
    if(arr == null){
        return;
    }

    if(n <=0 ){
        return arr;
    }

    return arr['slice'](0, Math.max(arr.length -(n || 1), 0));
};

/**
 * mu.update(Array arr, Function fn, T item)
 * 更新列表数据
 * @param arr
 * @param fn 更新数据的条件，可以是fn， 也可以是基本数据值
 * @param item 更新的数据
 * @returns {Array}
 */

/** exp.
    var list = [
        {id:1, name:"mizi.lin", age:32 },
        {id:2, name:"张三", age:13 },
        {id:3, name:"李思思", age:22 },
        {id:4, name:"王五", age:111 },
        "test"
    ];

    var item = {id:3, name:"李四", age:28 };

    mu.update(list, function(o){
        return o.id == this.id;
    }, item);

    mu.update(list, "test", item);

*/

mu.update = function(/**Array*/arr, /**Function*/ fn, /**T*/ item){
    var index = $$.indexOf(arr, fn, item);
    if(index === -1 ){
        console.log('error:::::更新失败:::::');
        return arr;
    }
    arr[index] = item;
    return arr;
};

/**
 * mu.update.top(Array arr, Function fn, T item)
 * 更新数据，并将该项置顶
 * @param arr
 * @param fn
 * @param item
 * @returns {Array}
 */
mu.update.top = function(/**Array*/ arr, /**Function*/ fn, /**T*/ item){
    var index = $$.indexOf(arr, fn, item);
    if(index === -1 ){
        console.log('error:::::更新失败:::::');
        return arr;
    }
    delete arr[index];
    arr.unshift(item);
    return $$.reindex(arr);
};

/**
 * mu.update.bottom(Array arr, Function fn, T item)
 * 更新数据，并将该项移到数组底部
 * @param arr
 * @param fn
 * @param item
 * @returns {Array}
 */
mu.update.bottom = function(/**Array*/ arr, /**Function*/ fn, /**T*/ item){
    var index = $$.indexOf(arr, fn, item);
    if(index === -1 ){
        console.log('error:::::更新失败:::::');
        return arr;
    }
    delete arr[index];
    arr[arr.length] = item;
    return $$.reindex(arr);
};

/**
 * -----------------
 * 字符串 String
 * -----------------
 */

/**
 * mu.concat(Array sign, String s...)
 * 字符串按照一定格式连接
 * @param sign || [""]
 * @param s...
 * @returns {string}
 */

/** exp.
    mu.concat("This","(","a",")", "string") =-> "This(a)string";
    mu.concat(["_"], "This","(","a",")", "string") =-> "This_(_a_)_string";
 */
mu.concat = function(/**Array*/sign, /**String*/ s ){
    var args = $$.args(arguments);
    sign = "";
    if($$.type(args[0], "array")){
        sign = args.shift()[0];
    }
    return args.join(sign||"");
};

/**
 * mu.leftpad(String s, Int l, String sign)
 * 左侧补全字符串
 * @param s
 * @param l
 * @param sign
 * @returns {String}
 */

/** exp.
    mu.left(2014, 8) => "00002014"
*/

mu.leftpad = function(/**String*/ s, /**Int*/ l, /**String*/ sign){
    sign = sign || "0";
    s = String(s);
    while(s.length<l){
        s = sign + s;
    }
    return s;
};

/**
 * mu.firstUpperCase(String s)
 * 字符串首字母大写
 * @param s
 * @returns {string|*}
 */
mu.firstUpperCase = function(/**String*/s) {
    var re = /([a-z])(.*)/gi;
    return s.replace(re, function( all, $1, $2 ) {
        return $1.toUpperCase() + $2;
    });
};

/**
 * mu.trim(String str, String position)
 * 去除字符串左右侧空格
 * @param str
 * @param postion
 * @returns {string|*}
 */
mu.trim = function( /**String*/str, /**String*/postion ){
    var pos = postion || "all";
    switch ( pos ){
        case "left":
            return str.replace( /(^\s*)/g, "" );
        case "right":
            return str.replace( /(\s*$)/g, "" );
        default:
            return str.replace( /(^\s*)|(\s*$)/g, "" );
    }
};

/**
 * mu.trim.left(String str)
 * 去除字符串左侧空格
 * @param str
 * @returns {string}
 */
mu.trim.left = function(/**String*/str){
    return $$.trim(str, "left");
};

/**
 * mu.trim.right(String str)
 * 去除字符串右侧空格
 * @param str
 * @returns {string}
 */
mu.trim.right = function(/**String*/str){
    return $$.trim(str, "right");
};

/**
 * -----------------
 * 时间 Date
 * -----------------
 */

/**
 * mu.timestamp(Date dt)
 * 返回时间戳（长时间格式）
 * @param dt
 * @returns {number}
 */
mu.timestamp = function(/**Date*/dt){
    return + (dt || new Date());
};

/**
 * -----------------
 * 常用工具 Tool
 * -----------------
 */

/**
 * mu.eq(T target, T src...)
 * 基本类型比较（强比较）
 * @type {boolean}
 */

/** exp.
    mu.eq("0", 1, 2, false, 0, "ddd") =-> false;
    mu.eq("0", 1, 2, "0") =-> true;
 */
mu.eq = mu.equlas = function(/**T*/ target, /**T...*/ src){
    var args = $$.args(arguments);
    if(args.length === 2){
        return target === src;
    }else{
        for(var i = 1, l = args.length; i < l; i++ ){
            if( src ===args[i] ){
                return true;
            }
        }
        return false;
    }
};

/**
 * mu.ie(Int ver)
 * 判断当前IE版本
 * @param ver
 * @returns {*}
 */
mu.ie = function(/**Int*/ ver){
    if(ver){
        return ver === $$.ie();
    }else{
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
};



mu.extend(mu);
window.mu = mu;
})(window);



