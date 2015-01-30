(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(window, angular, undefined){
'use strict';

angular.module('fdf.config.global', [])

//设置全局常量
.constant('constant', {
    // 版本号
    VERSION: '1.2.15',
    // 生产环境
    RELEASE: 'PROD',
    // 项目名称
    PRODUCT_NAME: 'FDF',

    // Header信息 -> X-TOKEN 在 storage 支持
    X_TOKEN: 'X-TOKEN',
    // Header信息 -> X-PROP 在 参数中的key
    X_PROP: 'X-PROP',

    // 架构控制参数
    FDF:{
        // 控制开关
        CTRL: {
            // 是否打开用户行为统计
            BAHAVIOR: false,
            // 用户行为提交地址
            BAHAVIOR_URL: "http://post.hunteron.com/post/index.html",
            // 是否打开百度统计
            BAIDU_TONGJI: false,
            // 百度统计ID
            BAIDU_TONGJI_ID: '1234566',
            // 是否打开GA统计
            GA: false,
            // GA ID
            GA_ID: '1234566',
            // 是否打开QQ
            QQ: false
        },
        // storage key
        STORAGE: {
            CURRENT: 'CURRENT'
        }
    },



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
        "X-TOKEN": mu.storage(C.X_TOKEN) || ''
    });

    /**
     * http 拦截器设置
     */
    $httpProvider.interceptors.push(function () {
        return {
            request: function (config) {
                // 给所请求的URL加版本号
                var url = app.$Base.version(config.url);

                // 从参数中设置 header "X-PROP"
                var data = config.data || {};
                var params = config.params || {};
                var prop = function(obj){
                    mu.run(!mu.empty(obj["X-PROP"]), function(){
                        var p = obj["X-PROP"];
                        if(mu.type(p, "array")){
                            p = p.join(",");
                        }
                        config.headers["X-PROP"] = p;
                    });
                    delete obj["X-PROP"];
                    return obj;
                };

                mu.run(!mu.empty(params), function(){
                    config.params = prop(params);
                });

                mu.run(!mu.empty(data), function(){
                    config.data = prop(data);
                });

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
                if (!rst.success && rst.error == C.ERROR.NO_LOGIN) {
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

.run(['app', 'constant', '$injector',
    function (app, constant, $injector) {

        // 方法类
        // angular 1.2.27 的 extend 有bug， 1.3.2 无
        app = mu.extend(app, mu);

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

        // 全局常量设置
        app.run(function(){
            if(!window.C){
                window.C = {};
            }

            window.C = app.extend(true, constant, window.C);
        });

        app.$rootScope.C = C;

        // 判断是否存在埋点对象
        if(!window.ELM){
            window.ELM = {};
        }

        app.$rootScope.ELM = ELM;

        /**
         * app._evt
         * 事件监听
         * @param e => $event
         */
        app._evt = function(e){
            return app.$Base.evt(e);
        };

        /**
         * app._ver
         * @param url
         * @returns {string}
         */
        app._ver = function (url){
            return app.$Base.ver(url);
        };

        //init
        app.run(function(){

            app.$rootScope.current = app.storage(C.FDF.STORAGE.CURRENT) || {};

            // 页面载入时间
            app.$rootScope.startTime = app.now();
            // 上次事件操作时间
            app.$rootScope.lastTime = app.now();
        });

    }])

;})(window, angular);



},{}],3:[function(require,module,exports){
(function (window, angular, undefined) {
    'use strict';

    angular.module('fdf.directives.base', [])

    .directive('fdfLink', ['app', function(app){
        return {
            restrict: 'AC',
            transclude: false,
            link: function(scope, elm, attr){
                elm.bind('click', function(e){
                    app.$Base.event({
                        e: e,
                        name: attr.fdfLink,
                        isChangePage: attr.fdfPage === "true"
                    });
                });
            }
        }
    }])

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
require('./directives/base.directive.js');
require('./filters/base.filter.js');
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
      'fdf.filters.base'
    ]);

    angular.module('fdf.directives', [
      'fdf.directives.base'
    ]);

    angular.module('fdf.config', [
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






},{"./config/global.js":1,"./config/setting.js":2,"./directives/base.directive.js":3,"./filters/base.filter.js":5,"./plusin/mu.js":6,"./resources/base.res.js":7,"./services/base.serv.js":8}],5:[function(require,module,exports){
(function(window, angular, undefined){
'use strict';

/*
 * 过滤器
 */
angular.module('fdf.filters.base', [])

/*
 * 时间格式化(文本)
 * @params String date 符合时间格式的字符串
 * @params format 格式化类型 || 'yyyy-MM-dd'
 * @return String;
 * @extend $filter('date')
 */

/**
 exp.
 {{ '2013-04-21 00:00:00' | mdate:'yyyy-MM-dd' }} => 2013-04-21
 {{ '1232221221' | mdate:'yyyy年' }} => 2013年
 {{ '21/04/2013 00:00:00' | mdate }} => 2013-04-21
 {{ '21/04/2013 00:00:00' | 'eeee' }} => 星期一
 {{ '21/04/2013 00:00:00' | 'ee' }} => 周一
 */

.filter('fdfDate', ['$filter',
    function($filter) {
        return function(date, format) {
            if (!date) {
                return;
            }

            var eeee = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var ee = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
            var dateVal = $filter('date')(new Date(date), format || 'yyyy-MM-dd');
            var day = new Date(date).getDay();
            if(dateVal.indexOf('eeee')>-1){
                dateVal = dateVal.replace(/eeee/g, eeee[day]);
            }else if(dateVal.indexOf('ee')>-1){
                dateVal = dateVal.replace(/ee/g, ee[day]);
            }

            return dateVal;
        };
    }
]);

})(window, angular);
},{}],6:[function(require,module,exports){
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
 * mu.ifexist(T t, T existVal, T nullVal)
 * 与ifnull相反，若t存在，显示existVal, 不存在 nullVal
 * @param t
 * @param existVal
 * @param nullVal
 * @returns {*|*|Object}
 */
mu.ifexist = function(/**T*/t, /**T*/existVal, /**T*/nullVal){
    return $$.ifnull(t, nullVal, existVal);
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
    if(aoc == null || fn == null){
        return aoc;
    }

    var arg = $$.args(arguments);

    if(typeof type !== "string"){
        scope = $$.clone(type);
        type = null;
    }

    type = type || $$.type(aoc);

    var rst = type === "object" ? {} : [];

    mu.each(aoc, function(v, k, aoc){
        var cb = fn.call(scope, v, k, aoc);
        if(cb != null ){
            if(type === "object"){
                if(cb.__val__ != null){
                    rst[ cb.__key__ || k ] = cb.__val__;
                }else{
                    rst[k] = cb;
                }

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
 * mu.extend([Boolean isDeep,]Object target, Object ...src)
 * 将src的属性覆盖到target上，若有相同的属性，会完全覆盖
 * @param isDeep 是否深转换, default false
 * @param target
 * @param src
 * @returns {Object}
 */


mu.extend = function(/**Boolean*/isDeep,  /**Obj*/src, /**obj*/target ){
    var args = $$.args(arguments);

    if($$.type(isDeep, "boolean")){
        isDeep = args.shift();
    }else{
        isDeep = false;
        src = args[0];
    }

    if(typeof src != "object"){
        return src;
    }

    var key, rst = {};
    for(var i = 0, l = args.length; i<l; i++){
        target = args[i];
        for(key in target){
            if(target.hasOwnProperty(key)){
                if(isDeep && $$.isObject(target[key]) && $$.isObject(src[key])){
                    rst = $$.clone(src[key]);
                    src[key] = $$.extend(isDeep, rst, target[key]);
                }else{
                    src[key] = target[key];
                }
            }
        }
    }

    return src;
};

/**
 * mu.isEmptyObject(Object obj)
 * 判断对象是否为空对象
 * @param obj
 * @returns {boolean}
 */
mu.isEmptyObject = function(/**Object*/obj){
    for(var key in obj) if(obj.hasOwnProperty(key)) {
        return false;
    }

    return true;
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
 * mu.now([String ignore])
 * 返回当前时间戳
 * @param ignore 非必要，是否忽略秒或毫秒 || 默认忽略毫秒
 * @returns {*|number}
 */
mu.now = function(/**String*/ignore){
    if(!ignore){
        return $$.timestamp();    
    }else{
         var d = new Date();
         d.setMilliseconds(0);
         if(ignore == "ss" ){
            d.setSeconds(0);
         }
         return d.getTime();
    }
    
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

//函数节流的意思，通俗一点就是函数调用的频度控制器，是连续执行时间间隔控制
//如果将水龙头拧紧直到水是以水滴的形式流出，那你会发现每隔一段时间，就会有一滴水流出。
//也就是会说预先设定一个执行周期，当调用动作的时刻大于等于执行周期则执行该动作，然后进入下一个新周期。
//throttle　　　　
mu.throttle = function(/**Function*/fn, /**Int*/wait, /**Boolean*/immediate, /**Boolean*/debounce){
    // 当前时间
    var currentTime = $$.now(),
    // 上次调用时间
    lastTime,
    // 上次函数调用时间
    lastExecTime,
    // 时间差
    diffTime,
    // 回调ID
    timeoutId,
    // 传递参数
    args,
    // 作用域，上下文
    scope,
    // 执行函数
    exec = function(){
        lastExecTime = currentTime;
        fn.call(scope, args);
    };

    return function(){
        currentTime = $$.now();
        scope = this;
        args = $$.args(arguments);
        diffTime = currentTime - (debounce ? lastTime : lastExecTime) - wait;
        clearTimeout(timeoutId);
        if(debounce){
            if(immediate){
                timeoutId = setTimeout(exec, wait);
            }else if(diffTime >= 0){
                exec();
            }
        }else{
            if(diffTime >= 0){
                exec();
            }else if(immediate){
                timeoutId = setTimeout(exec, -diffTime);
            }
        }

        lastTime = currentTime;
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
    var timeout;
    return function() {
        var scope = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) fn.apply(scope, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn.apply(scope, args);
    };
};

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
 * mu.isBaseType(T t)
 * 判断对象是否为基本类型
 * 基本类型： null, undefined, string, number, boolean
 * @param t
 * @returns {boolean}
 */
mu.isBaseType = function(/**T*/ t){
    return Object(t) !== t;
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
 * mu.parseUrl(String url)
 * 对象化链接信息
 * @param url
 * @returns {{source: (*|string), protocol: *, host: (options.hostname|*|.connect.options.hostname|string|urlResolve.hostname|ua.hostname), port: *, query: (Function|string|ui.autocomplete.search|search|urlResolve.search|ua.search|*), params: {query, hash, hashQuery}, file: (string|*), hash: *, path: string, relative: *, segments: (Array|*)}}
 */
mu.parseUrl = function (/**String*/url) {
    url = url || location.href;
    var a = document.createElement('a');
    a.href = url;

    var query = function(/**String*/str){
        var ret = {},
            seg = str.replace(/^[\?\#]/, '').split('&'),
            len = seg.length, i = 0, s;
        for (; i < len; i++) {
            if (!seg[i]) {
                continue;
            }
            s = seg[i].split('=');
            ret[s[0]] = s[1] || null;
        }
        return ret;
    };

    var hash = function(/**String*/str){
        var seg = str.split('?');
        return query(seg[0]);
    };

    var hashQuery = function(/**String*/str){
        var seg = str.split('?');
        return seg.length > 1 ?  query(seg[1]) : null;
    };

    var locations = {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: {
            query: query(a.search),
            hash: hash(a.hash),
            hashQuery: hashQuery(a.hash)
        },
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };

    // 若host为null, (ie8,9)
    locations.host = locations.host || location.host;
    locations.protocol = locations.protocol || location.protocol.replace(':', '');
    locations.origin = locations.protocol.origin || (locations.protocol + "://" + locations.host + $$.ifempty(locations.port, '', function(val){
        return ":" + val;
    }));

    return locations;
};
    
/**
 * mu.flat(Object obj, String ns)
 * 扁平化数据
 * @param obj
 * @param ns
 * @returns {*}
 */
mu.flat = function(/*Object*/obj, /**String*/ns){
    if($$.empty(obj)){
        return false;
    }

    var result = {};

    var recurse = function(cur, prop) {
        if($$.isBaseType(cur)){
            result[prop] = cur;
        } else if ($$.isArray(cur)) {
            $$.each(cur, function(v, i){
                recurse(v, $$.concat(prop, "[", i ,"]"));
            });

            if (cur.length == 0){
                result[prop] = [];
            }
        } else {
            var isEmpty = true;
            var key;

            for (key in cur) {
                isEmpty = false;
                recurse(cur[key], prop ? prop + '.' + key : key);
            }

            if (isEmpty){
                result[prop] = {};
            }
        }
    };

    if(ns){
        var o = {};
        o[ns] = obj;
        obj = $$.clone(o);
    }

    recurse(obj, "");

    return result;
};

/**
 * mu.params(Object params, Object opts)
 * 将对象参数化
 * @param params
 * @param opts
 * @returns {string}
 */
mu.params = function(/**Object*/params, /**Object*/opts){
    var flat = $$.flat(params);
    // 默认连接符号
    opts = $$.extend({
        "__equals__": "=",
        "__join__": "&"
    }, opts || {});

    var arr = $$.map(flat, function(v, key){
        return $$.concat(key, opts.__equals__, v);
    }, "array");

    return arr.join(opts.__join__);
};

/**
 * mu.url(String url, Object params, Boolean isExtend)
 * @param url
 * @param params Object{query,hash,hashQuery} || default query
 * @param isExtend Boolean:是否继承当前链接属性 || dafault true
 * @returns {*|ng.ui.IUrlMatcher|Array.<T>|string|UrlMatcher}
 */
mu.url = function(/**String*/url, /**Object*/params, /**Boolean*/isExtend){
    var parseUrl = $$.parseUrl(url), params__ = parseUrl.params || {};
    var opts = {};
    params = params || {};
    isExtend = isExtend == null ? true : isExtend;

    // 若params不设置具体的参数位，则默认为 query
    if( params.query == null && params.hash == null && params.hashQuery == null ){
        opts.query = $$.clone(params);
    }else{
        opts = $$.clone(params);
    }

    // 是否继承原链接的参数
    $$.run(isExtend, function(){
        params__ = $$.map(params__, function(v, k){
            return $$.extend(v, opts[k] || {});
        });
    }, function(){
        params__ = $$.clone(opts);
    });

    // 拼接链接信息
    var querys = $$.run(!$$.empty(params__.query), function(){
        return "?" + $$.params(params__.query);
    });

    var hashs = $$.run(!$$.empty(params__.hash), function(){
        return "#" + $$.params(params__.hash);
    });

    var hashQuerys = $$.run(!$$.empty(params__.hashQuery), function(){
        return "?" + $$.params(params__.hashQuery);
    });

    return $$.concat(parseUrl.origin, parseUrl.path, querys, hashs, hashQuerys);
};

mu.storage = function (/**String*/key, /**T*/val) {
    return $$.run(val == null, function () {
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




},{}],7:[function(require,module,exports){
(function (window, angular, undefined) {
'use strict';

angular.module('fdf.resources.base', [])

.service('$_Base', ['$resource', function ($resource) {
    return {
        bahavior: $resource(C.FDF.CTRL.BAHAVIOR_URL, null, {
            'post': {
                method: 'POST',
                uri: 'bahavior'
            }
        })
    }
}]);

})(window, angular);
},{}],8:[function(require,module,exports){
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
                currentUser = app.storage(C.FDF.STORAGE.CURRENT) || {};
            }
            return currentUser;
        };

        /**
         * 简单事件记录
         * 没有相关遮罩效果等
         * @param e
         * @param fn
         */
        base.evt = app.debounce(function(){
            //发送用户行为
            base.bahavior(e);
            //执行回调喊出
            fn && fn.call(null, e);
        }, 300);

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
        base.event = app.debounce(function(opts, eventfn, successfn, errorfn){
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
                isDisable: true,
                isChangePage: false,
                isBefore: false
            }, opts);

            var e = opts.e;
            var elm = angular.element(opts.elm || e.target);
            // 发送用户行为
            base.bahavior(e, opts);

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

                !opts.isBefore && fn.call(null, e);

                // 禁止双击事件
                opts.isDisabled && base.disabled.remove(elm);
                // 遮罩
                opts.isMask && base.mask.remove(elm);
                // 显示Loading载入条
                opts.isLoading && base.loading.remove(elm);

                opts.isBefore && fn.call(null, e);
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
        }, 300);

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
            var ver = C.VERSION || '1.1.0';

            // IE8 不设置当前版本号, 使用时间戳，强制刷新（清缓存）
            app.run(app.equals(app.ie(), 8, 9), function(){
               ver = app.timestamp();
            });

            return app.url(url, {'v': ver } );
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
         * @param opts
         */
        base.bahavior = function (e, opts) {
            //if(!app.SYS.BAHAVIOR.RUN){
            //   return false;
            //}

            opts = opts || {};

            // 获得当前用户信息
            var currentUser = base.currentUser();

            // 获得当前DOM信息
            var elm = angular.element(e.target);
            // 获得当前DOM上所绑定的ng scope信息
            var scope = elm.scope();

            // 向上冒泡寻找当前dom所在的module
            var moduleName = base.findModule(scope), duration;

            // 获得当前dom的scope，若有$index，则为该dom 所在list 的位置
            var position = scope.$index;
            position = position != null ? position + 1 : null;

            // 若evt没传入name，则再到dom中获取
            var name = opts.name || elm.attr('fdf-name');
            if(!app.isEmptyObject(ELM)){
                name = ELM[name];
            }

            var lastUrl = app.$rootScope.lastUrl;
            app.$rootScope.lastUrl = app.$location.absUrl();

            // 若页面跳转，计算页面存在时间
            if(opts.isChangePage){
                duration = app.now() - app.$rootScope.startTime;
                app.$rootScope.startTime = app.now();
            }

            var evtInfo = {
                // 当前事件类型
                type: e.type,
                // 当前事件触发时间
                timeStamp: e.timeStamp,
                // 当前事件与上次触发事件的间隔时间
                intervalTime: app.now() - app.$rootScope.lastTime,
                // 当前浏览器userAgent 信息
                userAgent: navigator.userAgent,
                // 当前用户操作系统信息
                os: currentUser.os,
                // 上次打开的页面url
                lastUrl: lastUrl,
                // 当前事件信息
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
                    // 当前DOM的信息
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
                // 当前用户ID
                userId: currentUser.id,
                // 事件触发事件
                clickTime: evtInfo.timeStamp,
                // 事件触发所在页面
                clickPage: app.$rootScope.channel,
                // 事件触发的 element 信息
                clickElement: name,
                // 事件触发所在模块
                clickModule: moduleName,
                // DOM 所在列表中的位置
                clickPosition: position,
                // 当前url full path
                url: app.$location.absUrl(),
                // 页面跳出时间
                duration: duration,
                // 当前产品名称
                productName: app.concat(C.PRODUCT_NAME, " ", C.RELEASE),
                // 当前事件距页面打开时间的间隔时间
                openToClickTime: app.now() - app.$rootScope.startTime,
                // 当前用户token
                token: currentUser.token,
                // 前端关注的事件信息
                fe: evtInfo
            });

            app.$log.log(bhinfo);

            //是否发送用户行为记录
            if(!C.FDF.CTRL.BAHAVIOR){
                app.$rootScope.lastTime = app.now();
                return false;
            }

            app.$_Base.bahavior.post({
                bahavior: bhinfo
            }, function(){
                app.$rootScope.lastTime = app.now();
            }, function(){
                app.$rootScope.lastTime = app.now();
            });
        };

        //通过向上冒泡，寻找当前scope所在最近距离的module信息
        base.findModule = function(scope){
            if(!app.isObject(scope)){
                return null;
            }

            var key = "module", moduleName, isFind;
            if(!scope[key]){
                app.each(scope, function(o){
                    if(app.type(o, "object")){
                        if(o[key]){
                            moduleName = o[key];
                            isFind = true;
                            return false;
                        }
                    }
                });

                if(!isFind){
                    moduleName = base.findModule(scope.$parent);
                }
            }else{
                moduleName = scope[key];
            }

            return moduleName;
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
},{}]},{},[4]);
