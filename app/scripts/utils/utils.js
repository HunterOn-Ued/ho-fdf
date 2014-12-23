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
    utils = angular.extend(utils, _);
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
     * 将 arguments 转为一个数组
     * @param args => arguments
     * @returns {Array.<T>}
     */
    utils.args = function( args ){
        return Array.prototype.slice.call( args, 0 );
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