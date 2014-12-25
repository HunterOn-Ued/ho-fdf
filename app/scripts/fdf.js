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
        app = mu.extend(app, utils);

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
require('./config/global.js');
require('./config/setting.js');
require('./utils/utils.js');
require('./resources/resource.base.js');
require('./services/service.base.js');

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






},{"./config/global.js":1,"./config/setting.js":2,"./resources/resource.base.js":4,"./services/service.base.js":5,"./utils/utils.js":6}],4:[function(require,module,exports){
(function (window, angular, undefined) {
'use strict';

angular.module('fdf.resources.base', [])

.service('$_Base', ['$resource', function ($resource) {
    return {
        bahavior: $resource('/bahavior', null, {
            'post': {
                method: 'POST',
                uri: 'bahavior'
            }
        })
    }
}]);

})(window, angular);
},{}],5:[function(require,module,exports){
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
         * 事件处理
         * @param e
         * @param res
         * @param opts
         * @param fn
         * @returns {*}
         */
        base.evt = function(e, res, opts, fn){
            var arg = Array.prototype.slice.call(arguments, 0);
            e = arg.shift();
            res = arg.shift();

            // 若倒数两个参数都是函数，则倒1为 errorfn, 倒2为 successfn
            // 若只有倒1为函数，则为 successfn
            fn = arg[arg.length - 1];
            var _fn = arg[arg.length - 2];
            var fn_ = function(rst){
                base.evt.end(e);
                return fn.call(window, rst);
            };

            if(app.isFunction(_fn)){
                fn = _fn;
                arg[arg.length - 2] = fn_;
            }

            arg[arg.length-1] = fn_;
            base.evt.begin(e);

            return res.apply(window, arg);
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

            // IE8 不设置当前版本号
            app.run(app.ie() == 8, function(){
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
         */
        base.bahavior = function (e) {
            if(!app.SYS.BAHAVIOR.RUN){
               return false;
            }

            var currentUser = base.currentUser();

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
            app.$_Base.bahavior.post({
                userId: currentUser.id,
                userName: currentUser.trueName,
                clickTime: evtInfo.timeStamp,
                clickModule: app.$rootScope.module,
                clickElement: evtInfo.info.target.tagName,
                clickPage: app.$location.path(),
                evtInfo: evtInfo
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
},{}],6:[function(require,module,exports){
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
     * 匿名函数输出
     * @param condition
     * @param fn
     * @param fn1
     * @returns {*}
     */
    utils.run = function (condition, fn, fn1) {
        if (utils.isFunction(condition)) {
            return condition();
        } else {
            return condition ? fn() : fn1 ? fn1() : null;
        }
    };

    /**
     * 判断ie浏览器版本
     * @returns {Number|*} -> 大于0 ie
     */
    utils.ie = function(){
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

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
     * 获得当前时间戳
     * @returns {number}
     */
    utils.timestamp = function () {
        return (+new Date());
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
                return o.path + o.query + '&' + p;
            } else {
                return o.path + '?' + p;
            }
        }
    };

}]);

})(window, angular);
},{}]},{},[3]);
