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