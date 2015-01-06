(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(window, angular, undefined){
'use strict';

angular.module('fdf.config.global', [])

//设置全局常量
.constant('constant', {
    /**
     * 页面样式
     */
    AREA_FRONT: 'front',
    AREA_BACKEND: 'backend',
    /**
     * 布局样式
     */
    LAYOUT_SINGLE: 'single',
    LAYOUT_DOUBLE: 'double',

    USER_TYPE: {
        '1': '企业',
        '2': '猎头'
    },

    /**
     * localStrong key
     */
    KEY: {
        //登录信息
        'LOGIN_INFO': 'LOGIN_INFO',
        //当前用户信息
        'CURRENT': 'CURRENT'
    },

    ERROR: {
        'NO_LOGIN': 'ERR1217326'
    },

    SYS: {
        ICON: 'images/hd64.png',

        //用户行为分析
        BAHAVIOR: {
            //是否打开用户行为分析
            RUN: false,
            //用户行为注册地址
            URL: 'http://post.hunteron.com/post'
        }
    }
})

//设置全局变量
.constant('app', {
    version: '0.1.0'
});

})(window, angular);

},{}],2:[function(require,module,exports){
(function (window, angular, undefined) {

'use strict';
/**
 * 全局环境配置
 * 1. 进度条
 * 2. 工具类集成
 * 3. http 监控
 * 3. Servers 初始化
 * Created by mizi on 2014/11/11.
 */

angular.module('fdf.config.setting', [])

//支持跨域
.config(['$sceDelegateProvider',
    function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://*.hunteron.com/**',
            'https://*.hunteron.com/**'
        ]);
    }
])

.config(['$httpProvider', 'app', function ($httpProvider, app) {

    //post 的 contentType 修正为 application/x-www-form-urlencoded
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    //表单参数设置
    $httpProvider.defaults.transformRequest = [function (data) {
        return data ? jQuery.param(data) : data;
    }];

    //默认给每次ajax 请求加上 head 信息
    $httpProvider.defaults.headers.common = angular.extend($httpProvider.defaults.headers.common, {
        'Device': 'Desktop',
        'X-citime': +new Date()
    });

    /**
     * http 拦截器设置
     */
    $httpProvider.interceptors.push(function () {
        return {
            request: function (config) {
                var url = app.$Base.version(config.url);

                /**
                 * 添加百度统计对异步页的监控
                 */
                try{
                    _hmt.push(['_trackPageview', url]);
                }catch(e){}

                config.url = url;
                return config;
            },

            /**
             * ajax 正常返回
             * @param res
             * @returns {*}
             */
            response: function (res) {
                var rst = res.data,
                    config = res.config,

                    /**
                     * @param ajaxType
                     * ajax 请求类型
                     * normal 普通请求（html, temp, json 等）
                     * active 主动发起请求
                     * request 向后台发起请求
                     * @type {*|string}
                     */
                    ajaxType = config.ajaxType || 'normal',

                    /**
                     * @param alertError
                     * 是否向用户发送错误信息
                     * @type {*|boolean}
                     */
                    alertError = config.alertError || false,
                    url = config.url;

                // 用户未登录
                if (!rst.success && rst.error == app.ERROR.NO_LOGIN) {
                    app.$log.log('::::::user no login or user session out:::::');
                    //TODO no login to do
                    return false;
                }

                if (ajaxType != 'normal') {
                    if (rst.success != null && !rst.success) {
                        if (alertError) {
                            app.$log.log(':::::ajax error alert::::', url);
                        } else {
                            app.$log.log(':::::ajax error no alert::::', url)
                        }

                        return app.$q.reject(res);
                    }
                }

                return res;
            },

            /**
             * ajax 返回异常
             * @param res
             * @returns {*}
             */
            responseError: function (res) {
                var config = res.config;

                return app.run(config, function(){
                    var alertError = config.alertError || false,
                        url = config.url;

                    if (alertError) {
                        app.$log.log(':::::load fail::::', res.status, '::::::', url);
                    } else {
                        app.$log.log(':::::load fail no alert::::', res.status, '::::::', url)
                    }

                    return app.$q.reject(res);
                }, function(){
                    return app.$q.reject(res);
                });
            }
        };
    });

    //载入条效果
    (function () {
        var count = 0;

        //ajax start
        $httpProvider.defaults.transformRequest.push(function (data, h) {
            count += 1;
            if (count == 1) {
                app.$log.log(':::load start::::');
//              app.ngProgressLite.start();
            }
            return data;
        });

        $httpProvider.defaults.transformResponse.push(function (data) {
            count -= 1;
            if (!count) {
                app.$timeout(function () {
                    app.$log.log(':::load end ::::');
//                  app.ngProgressLite.done();
                }, 500);
            }
            return data;
        });

    })();
}])

.config(['$resourceProvider', function($resourceProvider) {
    //1.2.x 版本暂时还不支持对 $resourceProvider 进行配置，1.3.x 支持
}])

.run(['app', 'constant', 'utils', '$injector',
    function (app, constant, utils, $injector) {

        // 常量赋值
        app = angular.extend(app, constant);

        // 方法类
        // angular 1.2.27 的 extend 有bug， 1.3.2 无
        app = utils.extend(app, utils);

        // 常用服务初始化
        app.$injector = $injector;
        app.$rootScope = $injector.get('$rootScope');
        app.$location = $injector.get('$location');
        app.$timeout = $injector.get('$timeout');
        app.$compile = $injector.get('$compile');
        app.$controller = $injector.get('$controller');
        app.$interval = $injector.get('$interval');
        app.$timeout = $injector.get('$timeout');
        app.$http = $injector.get('$http');
        app.$log = $injector.get('$log');
        app.$q = $injector.get('$q');
        app.$templateCache = $injector.get('$templateCache');

        app.$Base = $injector.get('$Base');
        app.$_Base = $injector.get('$_Base');

        /**
         * app._evt
         * 事件监听
         * @param e => $event
         */
        app._evt = function(e){
            return app.$Base.evt.begin(e);
        };

        /**
         * app._ver
         * @param url
         * @returns {string}
         */
        app._ver = function (url){
            return app.$Base.ver(url);
        };

        app._uri = function(url, type){
            switch(type){
                case 'bahavior':
                    return 'bahavior' + url;
                default:
                    var uri = location.pathname;
                    return uri + url;
            }
        };

        //身份令牌的设置
        app.run(function () {
            var loginInfo = app.storage(app.KEY.LOGIN_INFO) || {};
            app.$http.defaults.headers.common['X-AUTH-TOKEN'] = loginInfo['userToken'] || 'user token value';
        });

        //init
        app.run(function(){
            app.storage(app.KEY.CURRENT, {});
            app.storage(app.KEY.VERSION, '1.1.0');

            app.$rootScope.current = app.storage(app.KEY.CURRENT) || {};
            app.$rootScope.area = app.AREA_BACKEND;
        });

    }])

;})(window, angular);



},{}],3:[function(require,module,exports){
(function (window, angular, undefined) {
    'use strict';

    angular.module('fdf.directives.base', [])

    .directive('fdfBtn', ['app', function(app){
        return {
            restrict: 'AC',
            transclude: false,
            priority: -100,
            link: function(scope, element, attr){

                // 禁止双金事件
                element.on('dblclick', function(e){
                    app.$log.log(':::double click:::');
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                });

                // 绑定点击事件，防止双击触发
                element.on('click', function(e){
                    app.$timeout(function(){
                        attr.$set('disabled', 'true');
                        attr.$set('ngDisabled', 'true');
                        element.addClass('loading');
                        if(!element.find('span.loading').length){
                            element.html('<span>' + element.html() + '</span><span class="loading">Loading...</span>');
                        }
                    }, 0);
                    return false;
                });

                // 禁用disabled
                if( attr.ngDisabled ){
                    element.addClass('disabled');
                }else if(element[0].disabled){
                    element.addClass('disabled');
                }else if( element.hasClass('disabled') ){
                    attr.$set('disabled', 'true');
                    attr.$set('ngDisabled', 'true');
                }
            }
        }
    }])




})(window, angular);
},{}],4:[function(require,module,exports){
require('./plusin/mu.js');
require('./config/global.js');
require('./config/setting.js');
require('./utils/utils.js');
require('./directives/base.directive.js');
require('./resources/base.res.js');
require('./services/base.serv.js');

(function(window, angular, undefined){
    'use strict';

    angular.module('fdf.resources', [
        'fdf.resources.base'
    ]);

    angular.module('fdf.services', [
        'fdf.services.base'
    ]);

    angular.module('fdf.controllers', [
    ]);

    angular.module('fdf.filters', [
//    'fdf.filters.string',
//    'fdf.filters.data',
//    'fdf.filters.array',
//    'fdf.filters.math'
    ]);

    angular.module('fdf.directives', [
      'fdf.directives.base'
//    'fdf.directives.dom',
//    'fdf.directives.ui',
//    'fdf.directives.widget'
    ]);

    angular.module('fdf.config', [
        'fdf.config.utils',
        'fdf.config.global',
        'fdf.config.setting'
    ]);

    angular.module('fdf', [
        'ngSanitize',
        'ngResource',
        'fdf.config',
        'fdf.filters',
        'fdf.directives',
        'fdf.resources',
        'fdf.services',
        'fdf.controllers'
    ]);

})(window, angular);






},{"./config/global.js":1,"./config/setting.js":2,"./directives/base.directive.js":3,"./plusin/mu.js":5,"./resources/base.res.js":6,"./services/base.serv.js":7,"./utils/utils.js":8}],5:[function(require,module,exports){
/**
 * mizi utils
 * 米子的工具类库
 * @ -> 向 Underscore 致敬
 * @ -> 不考虑 ie8 以下版本
 *
 * * AOC: array * collection * object
 * * T: 泛型，所有类型
 */

//阅读源码，是提升技术最好的方法。
//
//若要求道（ To follow the path:）
//看着大师（ look to the master,）
//追隨大师（ follow the master,）
//接近大师（ walk with the master,）
//看穿大师（ see through the master,）
//成为大师（ become the master.）

(function(window, undefined){

'use strict';
// 创建闭包全局
var root = this;
var $$, mu;

// 创建对象式的调用方式， 返回一个包装器
// 包装器对象中包含所有的 mu 方法
// mu 为一个函数对象，实例服从单例模式
// 模拟 Underscore 的 _(obj)
mu = $$ = function(/**T*/obj){
    //如果参数为$$对象，说明已经实例化过了，所以直接返回
    if (obj instanceof $$) return obj;
    //如果实例化时没有使用new，那么在这里包装一下，使得this指向该实例
    if (!(this instanceof $$)) return new $$(obj);
    //将obj保存在内部属性__wrapped__中
    this.__wrapped__ = obj;
    //链式访问权限
    this.__chain__ = false;
};

mu.VERSION = '1.5.1';

var slice = [].slice,
    push = [].push,
    toString = Object.prototype.toString;

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

mu.args.slice = function(/**Arguments*/args, /**Int*/n){
    return slice.call(args, n || 0);
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
 * dat 为 fn 就是闭包的写法
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
            if(fn.call(scope, aoc[i], i, aoc) == false){
                return;
            }
        }
    // 对象，集合
    }else{
        for(var key in aoc){
            if(aoc.hasOwnProperty(key)){
                if(fn.call(scope, aoc[key], key, aoc) == false){
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
    if(typeof target != "object"){
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
 * mu.isEmptyObject(Object obj)
 * 判断对象是否为空对象
 * @param obj
 * @returns {boolean}
 */
mu.isEmptyObject = function(/**Object*/obj){
    for(var key in obj) if(t.hasOwnProperty(key)) {
        return false;
    }
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
 * mu.remove(AOC aoc, SI si)
 * 删除对象或数组某一项
 * @param aoc
 * @param si 数组为 Int index, 对象 String key
 * @returns {AOC} array: 重建索引值
 */
mu.remove = function(/*AOC*/aoc, /**SI*/si){
    if(aoc.length === + aoc.length){
        aoc["splice"](si, 1);
    }else{
        delete aoc[si];
    }
    return aoc;
};

/**
 * mu.size(AOC aoc)
 * 返回对象属性个数 && 数组长度
 * @param aoc
 * @returns {int}
 */
mu.size = function(/*AOC*/ aoc){
    return $$.keys(aoc).length;
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
 * mu.unique(Array arr)
 * 数组去重，重建索引
 * @param arr
 * @returns {Array}
 */
mu.unique = function(arr){
    var rst = [], l = arr.length;
    for(var i = 0; i < l; i++) {
        for(var j = i + 1; j <= l; j++) {
            if( arr[i] === arr[j]){
                l = $$.remove(arr, j).length;
                break;
            }
            rst[i] = arr[i];
        }
    }

    return rst;
};

/**
 * mu.pluck(Array arr, String key)
 * 获得列表每个对象的key的属性值，返回一个数组
 * @param arr
 * @param key
 * @returns {*}
 */
mu.pluck = function(/**Array*/arr, /**String*/key){
    return $$.map(arr, function(v){
        return v[key];
    })
};

/**
 * mu.function(Object obj)
 * 返回一个对象的方法名，并排序
 * @param obj
 * @returns {Array.<T>}
 */
mu.functions = function(/**Object*/obj) {
    var names = [];
    var key;
    for (key in obj) if (typeof obj[key] === "function") {
        names.push(key);
    }
    return names.sort();
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
 * mu.now()
 * 返回当前时间戳
 * @returns {*|number}
 */
mu.now = function(){
    return $$.timestamp();
};


/**
 * -----------------
 * 数字 math|number
 * -----------------
 */

/**
 * mu.max(Number n...)
 * 计算几个数值中的最大值
 * @param n
 * @returns {number}
 */
mu.max = function(/**Number...*/n){
    return Math.max.apply(this, arguments);
};

/**
 * ----------------
 * 函数方法 Function
 * ----------------
 */

/**
 * mu.bind(Object scope, Function fn[, T t...])
 * 绑定函数fn到对象上，, 也就是无论何时调用函数, 函数里的 this 都指向这个 object.
 * 任意可选参数 arguments 可以传递给函数 function , 可以填充函数所需要的参数, 这也被称为 partial application
 * @param scope
 * @param fn
 * @param arg
 * @returns {Function}
 */

/** exp.
    var fn = function(name, age){
        return mu.concat("公司：", this.company, " 姓名：", name, " 岁数：", age);
    };
    fn = mu.bind({company: 'Hunteron'}, fn, 'Mizi');
    fn(32);
    =-> "公司：Hunteron 姓名：Mizi 岁数：32"
 */

mu.bind = function(/**Obj*/scope, /**Function*/fn, /*T...*/arg){
    var args = $$.args(arguments), bound;
    if(typeof args[0] == "function"){
        fn = args.shift();
        scope = null;
    }else{
        scope = args.shift();
        fn = args.shift();
    }

    bound = function () {
        var currentArgs = $$.args(arguments);
        if(!(this instanceof bound)){
            return fn.apply(scope, args.concat(currentArgs));
        }
        var Ctor = $$.noop();
        Ctor.prototype = fn.prototype;
        var self = new Ctor;
        Ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(currentArgs)));
        if ($$.isObject(result)) return result;
        return self;
    };

    return bound;
};

/**
 * mu.partial(Function fn, T arg...)
 * 不改变作用域，预定义部分参数值
 * @param fn
 * @param arg
 * @returns {function(this:mu)|*}
 */
/** exp.
    var add = function(a, b) { return a + b; };
    add5 = mu.partial(add, 5);
    add5(10); =->15
    add5(15); =->20
 */
mu.partial = function(/**Function*/fn, /**T..*/arg){
    return $$.bind.apply(this, arguments);
};

/**
 * mu.delay(Function fn, Int delayTime, T arg...)
 * 类似setTimeout, 比其多了一个功能，可以传参数进去
 * @param fn
 * @param delayTime
 * @param arg
 * @returns {number}
 */
mu.delay = function(/**Function*/fn, /**Int*/delayTime, /**T...*/arg){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }

    var args = $$.args.slice(arguments, 2);
    return setTimeout(function(){
        return fn.apply(null, args);
    }, delayTime);
};

/**
 * mu.undelay(Function fn, Int delayTime, T arg...)
 * 类似setTimeout, 比其多了一个功能，可以传参数进去
 * 不等待执行fn （ 执行两次 fn ）
 * @param fn
 * @param delayTime
 * @param arg
 * @returns {number}
 */
mu.undelay = function(/**Function*/fn, /**Int*/delayTime, /**T...*/arg){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }

    var args = $$.args.slice(arguments, 2);
    fn.apply(null, args);
    return setTimeout(function(){
        return fn.apply(null, args);
    }, delayTime);
};

/**
 * mu.defer(Function fn[, T arg...])
 * 延迟调用fn知道当前调用栈清空为止
 * @param fn
 * @param arg
 * @returns {*}
 */
mu.defer = function(/**Function*/fn, /**T...*/arg ){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }

    var args = $$.args.slice(arguments, 1);
    return $$.delay.apply(null, [fn, 1].concat(args));
};

/**
 * mu.once(Function fn[, Object scope]
 * 函数只能运行一次
 * @param fn
 * @param scope
 * @returns {*}
 */
mu.once = function(/**Function*/fn, /**Object*/scope){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }
    return $$.only(1, fn, scope);
};

/**
 * mu.only(Int n, Function fn[, Object scope])
 * fn 运行 n 次后失效
 * @param n
 * @param fn
 * @param scope
 * @returns {Function}
 */
mu.only = function(/**Int*/n, /**Function*/fn, /**Object*/scope){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }

    var memo;
    return function() {
        if (--n > -1) {
            memo = fn.apply(scope, arguments);
        } else {
            // 超过运行次数，清除该函数
            fn = null;
        }
        return memo;
    };
};

/**
 * mu.after(Int n, Function fn[, Object scope])
 * fn 运行 n 次后生效
 * @param n
 * @param fn
 * @param scope
 * @returns {Function}
 */
mu.after = function(/**Int*/n, /**Function*/fn, /**Object*/scope){
    if (!$$.isFunction(fn)) {
        throw new TypeError;
    }
    return function() {
        if (--n < 1) {
            return func.apply(scope, arguments);
        }
    };
};

    /**
     * mu.debounce(Function fn, Int wait)
     * 如果用手指一直按住一个弹簧，它将不会弹起直到你松手为止。
     * 也就是说当调用动作n毫秒后，才会执行该动作，若在这n毫秒内又调用此动作则将重新计算执行时间
     * @param fn
     * @param wait
     * @param immediate
     */
mu.debounce = function(/**Function*/fn, /**Int*/wait, /**Boolean*/immediate){
    var timeout, args, scope, timestamp, rst;
    wait = wait || 300;
    immediate = immediate || false;

};

//如果将水龙头拧紧直到水是以水滴的形式流出，那你会发现每隔一段时间，就会有一滴水流出。
//也就是会说预先设定一个执行周期，当调用动作的时刻大于等于执行周期则执行该动作，然后进入下一个新周期。
//throttle　　　　　　　　　　　　　　　　　　　　　　　　　　　　　

/**
 * -----------------
 * 常用工具 Tool
 * -----------------
 */

mu.isFunction = function(/**T*/ t){
    return typeof t === "function";
};

mu.isObject = function(/**T*/ t){
    return $$.type(t, "object");
};

mu.isArray = function(/**T*/ t){
    return $$.type(t, "array");
};

/**
 * mu.eq(T target, T src...)
 * 基本类型比较（强比较）
 * @type {boolean}
 */

/** exp.
    mu.eq("0", 1, 2, false, 0, "ddd") =-> false;
    mu.eq("0", 1, 2, "0") =-> true;
 */
mu.eq = mu.equals = function(/**T*/ target, /**T...*/ src){
    var args = $$.args(arguments);
    if(args.length === 2){
        return target === src;
    }else{
        for(var i = 1, l = args.length; i < l; i++ ){
            if(target ===args[i]){
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

mu.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return typeof value === "function" ? object[property]() : value;
};

/**
 * -----------------
 * 链式调用语法
 * -----------------
 */

/**
 * mu.chain(T t)
 * 返回一个封装的对象. 在封装的对象上调用方法会返回封装的对象本身, 直道 value 方法调用为止.
 * 需要注意的是第一个参数为obj，在对象式调用时会省掉
 * @param t
 * @return mu
 */
mu.chain = function(/**T*/t){
    var instance = $$(t);
    instance.__chain__ = true;
    return instance;
};

/**
 * _result(t)
 * 判断是否链式调用
 * @param t
 * @returns {mu|*}
 * @private
 */
var _result = function(/**T*/ t) {
    return this.__chain__ ? $$(t).chain() : t;
};

/**
 * mu.tap(T t, Function fn)
 * 主要用来调试链式调用的中间步骤
 * 把 t 作为参数来调用fn， 并返回本身 t
 * @param t
 * @param fn
 * @returns {T}
 */
mu.tap = function(/**T*/t, /**Function*/ fn){
    fn(t);
    return t;
};

/**
 * chain..value()
 * 获得链接调用的最终结果
 * @returns {T|*|_.__wrapped__|h.__wrapped__}
 */
mu.prototype.value = function() {
    return this.__wrapped__;
};

//此方法暴露出来，供自定义扩展使用
mu.mixin = function(obj) {
    $$.each($$.functions(obj), function(name){
        //定义方法，供函数式调用
        var func = $$[name] = obj[name];
        //定义到prototype上，供对象式调用
        $$.prototype[name] = function() {
            //将实例化时传递给构造函数的对象作为第一个参数
            var args = [this.__wrapped__];
            // 合并参数
            Array.prototype.push.apply(args, arguments);
            //判断是否要链式调用
            return _result.call(this, func.apply($$, args));
        };

        var funcs = $$.functions(func);
        if(funcs.length){
            $$.each(funcs, function(method){
                $$.prototype[$$.concat(name, $$.firstUpperCase(method))] = $$.prototype[name+"."+method] = function() {
                    var args = [this.__wrapped__];
                    Array.prototype.push.apply(args, arguments);
                    return _result.call(this, func[method].apply($$, args));
                };
            });
        }
    });
};

//到$$上的方法附加到$$的prototype上，实现对象式调用
mu.mixin($$);

window.mu = mu;
})(window);




},{}],6:[function(require,module,exports){
(function (window, angular, undefined) {
'use strict';

angular.module('fdf.resources.base', [])

.service('$_Base', ['$resource', function ($resource) {
    return {
        bahavior: $resource('http://post.hunteron.com/post/', null, {
            'post': {
                method: 'POST',
                uri: 'bahavior'
            }
        })
    }
}]);

})(window, angular);
},{}],7:[function(require,module,exports){
(function (window, angular, undefined) {
'use strict';

angular.module('fdf.services.base', [])

    .service('$Base', ['app', function (app) {
        var base = {};

        /**
         * 获得当前用户信息
         * @returns {Function|{}}
         */
        base.currentUser = function(){
            var currentUser = app.$rootScope.currentUser || {};
            if(app.isEmptyObject(currentUser)){
                currentUser = app.storage(app.KEY.CURRENT) || {};
            }
            return currentUser;
        };

        /**
         * 简单事件记录
         * 没有相关遮罩效果等
         * @param e
         * @param name
         * @param fn
         */
        base.evt = function(e, name, fn){
            //发送用户行为
            base.bahavior(e, name || '');
            //执行回调喊出
            fn && fn.call(null, e);
        };

        base.disabled = function (elm) {

        };

        base.disabled.remove = function(elm){

        };

        base.mask = function(elm){

        };

        base.mask.remove = function(elm){

        };

        base.loading = function(elm){

        };

        base.loading.remove = function(elm){

        };

        /**
         * 事件整合处理
         * @param opts
         * @param eventfn
         * @param successfn
         * @param errorfn
         */
        base.event = function(opts, eventfn, successfn, errorfn){
            var args = app.args(arguments), rst;

            if(app.type(args[0], "function")){
                opts = {};
                eventfn = args[0];
                successfn = args[1] || app.noop();
                errorfn = args[2] || app.noop();
            }

            opts = app.extend({
                e: null,
                elm: null,
                name: "",
                isLoading: true,
                isMask: true,
                isDisable: true
            }, opts);

            var e = opts.e;
            var elm = angular.element(opts.elm || e.target);
            // 发送用户行为
            base.bahavior(e, opts.name);

            if(args.length === 1){
                return;
            }else if(args.length === 2){
                rst = false;
                successfn = eventfn;
            }else{
                rst = eventfn.call(null, e);
            }

            //结束事件
            var thend = function(opts, fn){
                var e = opts.e;
                var elm = opts.elm || e.target;
                // 禁止双击事件
                opts.isDisabled && base.disabled.remove(elm);
                // 遮罩
                opts.isMask && base.mask.remove(elm);
                // 显示Loading载入条
                opts.isLoading && base.loading.remove(elm);

                fn.call(null, e);
            };

            // 禁止双击事件
            opts.isDisabled && base.disabled(elm);
            // 遮罩
            opts.isMask && base.mask(elm);
            // 显示Loading载入条
            opts.isLoading && base.loading(elm);

            // 若返回值为false，则执行原方法
            app.run(!rst, function(){
                successfn();
            }, function(){
                // 若返回对象，则默认返回 resource
                app.run(app.type(rst, "object"), function(){
                    rst.$promise.then(function(rst){
                        var args = app.args(arguments);
                        thend(opts, function(e){
                            successfn.apply(null, args);
                        });
                    }, function(err){
                        var args = app.args(arguments);
                        thend(opts, function(e){
                            errorfn.apply(null, args);
                        });

                    });
                }, function(){
                    thend(opts, function(e){
                        successfn();
                    });
                });
            });

        };

        /**
         * 开始监控事件
         * @param e
         * @returns {*}
         */
        base.evt.begin = function(e){
            return app.$Base.bahavior(e);
        };

        /**
         * 监控介绍按钮返回
         * @param e
         */
        base.evt.end = function(e){
            var elm = angular.element(e.currentTarget);
            app.$timeout(function(){
                elm.removeClass('loading').removeAttr('disabled');
                elm.attr('ng-disabled', 'false');
            }, 500);
        };

        /**
         * 给当前的url添加版本号
         * @param url
         * @returns {*}
         */
        base.version = function(url){
            // 使用模板不使用版本
            if(app.$templateCache.get(url)){
                return url;
            }

            // 获取当前版本号
            var ver = app.run(function(){
                return app.storage(app.KEY.VERSION) || '1.1.0';
            });

            // IE8 不设置当前版本号, 使用时间戳，强制刷新（清缓存）
            app.run(app.equals(app.ie(), 8, 9), function(){
               ver = app.timestamp();
            });

            return app.params(url, {'v': ver } );
        };

        /**
         * 判断当前用户是否有权限
         * @param permission => string 待校验的用户权限信息
         * @retuen {boolean}
         */
        base.permission = function(permission){
            var allPermission = store.get(app.USER_PERMISSION),
                permissionArray = permission.toString().split(","),
                l = permissionArray.length;

            if (l) {
                for (var i = 0; i < j; i++) {
                    if (allPermission[permissionArray[i]]) {
                        return true;
                    }
                }

                //TODO 记录用户违权操作记录
                return false;
            }

            return true;
        };

        /**
         * 保存用户行为
         * @param e
         * @param name
         */
        base.bahavior = function (e, name) {
            //if(!app.SYS.BAHAVIOR.RUN){
            //   return false;
            //}

            var currentUser = base.currentUser();

            var elm = angular.element(e.target);
            var moduleElm, moduleName, position;

            // 向上冒泡寻找当前dom所在的module
            moduleElm = elm.hasClass('fdf-module') ? elm: elm.closest('.fdf-module');
            moduleName = moduleElm ? moduleElm.attr("fdf-module") : '';

            // 获得当前dom的scope，若有$index，则为该dom 所在list 的位置
            position = elm.scope().$index;
            position = position != null ? position + 1: null;

            // 若evt没传入name，则再到dom中获取
            name = name || elm.attr('fdf-name');

            var evtInfo = {
                type: e.type,
                timeStamp: e.timeStamp,
                info: {
                    // 当事件被触发时鼠标指针向对于浏览器页面（或客户区）的坐标
                    clientX: e.clientX,
                    clientY: e.clinetY,
                    // 发生事件的地点在事件源元素的坐标
                    offsetX: e.offsetX,
                    offsetY: e.offsetY,
                    // 鼠标指针的位置，相对于文档的左边缘
                    pageX: e.pageX,
                    pageY: e.pageY,
                    // 窗口的左上角在屏幕上的的 x 坐标和 y 坐标 (ie不支持)
                    screenX: e.screenX,
                    screenY: e.ecreenY,
                    target: {
                        innerHTML: e.target.innerHTML,
                        tagName: e.target.tagName,
                        offsetWidth: e.target.offsetWidth,
                        offsetHeight: e.target.offsetHeight,
                        offsetLeft: e.target.offsetLeft,
                        offsetTop: e.target.offsetTop,
                        offsetParentTagName: e.target.offsetParent.tagName,
                        scrollHeight: e.target.scrollHeight,
                        scrollLeft: e.target.scrollLeft,
                        scrollTop: e.target.scrollTop,
                        scrollWidth: e.target.scrollWidth
                    }
                }
            };

            // 添加百度事件统计, 用户行为分析
            try {
                // _hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
                // category：要监控的目标的类型名称，通常是同一组目标的名字，比如"视频"、"音乐"、"软件"、"游戏"等等。该项必选。
                // action：用户跟目标交互的行为，如"播放"、"暂停"、"下载"等等。该项必选。
                // opt_label：事件的一些额外信息，通常可以是歌曲的名称、软件的名称、链接的名称等等。该项可选。
                // opt_value：事件的一些数值信息，比如权重、时长、价格等等，在报表中可以看到其平均值等数据。该项可选。

                _hmt.push(['_trackEvent', '事件监控', evtInfo.type, evtInfo.target.innerHTML, evtInfo.timeStamp]);

            } catch (e) {
            }


            //	用户名（userId）
            //	点击时间（clickTime）
            //	点击页面名称（clickPage）
            //	点击模块名称（clickModule）
            //	点击元素名称（clickElement）

            //	点击元素所在模块位置（clickPosition）
            //	页面停留时间（duration）
            // 向后端传递
            var bhinfo = JSON.stringify({
                userId: currentUser.id,
                clickTime: evtInfo.timeStamp,
                clickPage: app.$rootScope.page,
                clickElement: name,
                clickModule: moduleName,
                clickPosition: position,
                url: app.$location.absUrl(),
                duration: '',
                userAgent: '',
                token: '',
                fe: evtInfo
            });

            app.$_Base.bahavior.post({
                bahavior:bhinfo
            });
        };

        /**
         * 调用浏览器 Notification, 通知用户
         * @param title
         * @param options
         */
        base.notify = function(title, options){
            var opts = {
                icon: app.SYS.ICON
            };
            options = app.extend(opts, options || {});
            return new Notification(title, options);
        };

        /**
         * 向浏览器注册支持 Notify
         */
        base.notify.register = function(){
            if (!("Notification" in window)) {
                app.$log.log('this bowser no support Notification');
                return false;
            }else if(Notification.permission !== 'denied'){
                Notification.requestPermission(function (permission) {
                    if(!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                });
            }
        };

        return base;
    }]);

})(window, angular);
},{}],8:[function(require,module,exports){
(function (window, angular, undefined) {
'use strict';

angular.module('fdf.config.utils', [])

.constant('utils', {
    version: '0.3.0'
})

//用户工具类
.run(['utils', function (utils) {
    /**
     * underscroe 中文文档
     * http://www.css88.com/doc/underscore/
     */
    utils = angular.extend(utils, mu);
    var __ = {};

    /**
     * 本地localStroage 存储读取
     * @param key
     * @param val
     */
    utils.storage = function (key, val) {
        return utils.run(val == null, function () {
            var _val = localStorage.getItem(key);
            if (typeof _val != 'string') {
                return undefined;
            }

            try {
                return JSON.parse(_val);
            } catch (e) {
                return _val || undefined;
            }

        }, function () {
            localStorage.setItem(key, JSON.stringify(val));
        });
    };

    /**
     * urils.paseUrl（String url)
     * 解构一个url地址
     * @param url
     * @returns {{source: (*|string), protocol: *, host: (options.hostname|*|.connect.options.hostname|string|ua.hostname|urlResolve.hostname), port: *, query: *, params, file: *, hash: *, path: *, relative: *, segments: *}}
     */
    utils.parseUrl = function (url) {
        url = url || location.href;
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            origin: a.origin,
            params: (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    };

    /**
     * utils.params(params)
     * 创建一个序列化的数组或对象，适用于一个URL地址查询字符串或Ajax请求
     * utils.params(url, params)
     * 创建一个序列化的数组或对象，返回一个完整的url地址
     * @param url
     * @param params
     * @use utils.parseUrl
     */
    utils.params = function (url, params) {
        var arr = Array.prototype.slice.call(arguments, 0);
        if (utils.isObject(arr[0])) {
            return jQuery.param(arr[0]);
        } else {
            var o = utils.parseUrl(url),
                p = utils.params(params);
            if (o.query) {
                return o.origin + o.path + o.query + '&' + p;
            } else {
                return o.origin + o.path + '?' + p;
            }
        }
    };



}]);

})(window, angular);
},{}]},{},[4]);
