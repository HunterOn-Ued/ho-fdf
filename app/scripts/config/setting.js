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


