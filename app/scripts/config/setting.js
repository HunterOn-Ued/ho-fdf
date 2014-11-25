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
                var url = config.url;
                // 为每次请求，添加版本控制
                config.url = app._ver(config.url);

                /**
                 * 添加百度统计对异步页的监控
                 */
                try{
                    app.$log.log('::->::->', url);
                    app.run(_hmt, function(){
                        _hmt.push(['_trackPageview', url]);
                    });

                    // TODO 每次异步请求，用户行为监控

                }catch(e){
                }

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
                var config = res.config,
                    alertError = config.alertError || false,
                    url = config.url;

                if (alertError) {
                    app.$log.log(':::::load fail::::', res.status, '::::::', url);
                } else {
                    app.$log.log(':::::load fail no alert::::', res.status, '::::::', url)
                }

                return app.$q.reject(res);
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

.run(['app', 'constant', 'utils', '$injector',
    function (app, constant, utils, $injector) {

        //常量赋值
        app = angular.extend(app, constant);

        //方法类
        // angular 1.2.27 的 extend 有bug， 1.3.2 无
        app = utils.extend(app, utils);

        //常用服务初始化
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

        app.$Base = $injector.get('$Base');
        app.$BaseResource = $injector.get('$BaseResource');

        app.$rootScope.current = app.storage(app.KEY.CURRENT) || {};

        /**
         * 事件监听
         * @param e => $event
         */
        app.evt = function(e){
            // _hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
            // category：要监控的目标的类型名称，通常是同一组目标的名字，比如"视频"、"音乐"、"软件"、"游戏"等等。该项必选。
            // action：用户跟目标交互的行为，如"播放"、"暂停"、"下载"等等。该项必选。
            // opt_label：事件的一些额外信息，通常可以是歌曲的名称、软件的名称、链接的名称等等。该项可选。
            // opt_value：事件的一些数值信息，比如权重、时长、价格等等，在报表中可以看到其平均值等数据。该项可选。

            var currentUser = store.get(app.KEY.CURRENT);

            var evt = {
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
                        offsetParent: e.target.offsetParent,
                        scrollHeight: e.target.scrollHeight,
                        scrollLeft: e.target.scrollLeft,
                        scrollTop: e.target.scrollTop,
                        scrollWidth: e.target.scrollWidth
                    }
                }
            }



        };

        //获得当前版本信息
        app._ver = function (url){
            //TODO 版本控制
            return url + '?v=' + ( false || '1.0' );
        };

        app.isLogin = function () {
            var loginInfo = app.storage(app.KEY.LOGIN_INFO) || {};
            return loginInfo.isLogin || false;
        };

        //身份令牌的设置
        app.run(function () {
            var loginInfo = app.storage(app.KEY.LOGIN_INFO) || {};
            app.$http.defaults.headers.common['X-AUTH-TOKEN'] = loginInfo['userToken'] || 'user token value';
        });

        /**
         * 检测用户是否登录
         */
//   app.$interval(function(){
//        var loginInfo = app.storage(app.KEY.LOGIN_INFO) || {},
//            lastTime = loginInfo.lastTime || 0;
//        var currentTime = + new Date();
//        if( (currentTime - lastTime > 1000*60*5) ){
//            $http({
//                method: 'get',
//                url: '/store/test/current.json',
//                ajaxType: 'active'
//            }).success(function(rst){
//                if(rst.success){
//                    loginInfo.lastTime = + new Date();
//                    app.storage(app.KEY.LOGIN_INFO, loginInfo);
//                }
//            });
//        }
//    }, 1000*6 );

        app.$http({method: 'get', url: '/store/test/test.json', ajaxType: 'normal', data: {
            'ccc': 2
        }});

        app.$Base.bahavior({});

    }])
;


