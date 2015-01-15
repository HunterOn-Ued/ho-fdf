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
        base.evt = function(e, fn){
            //发送用户行为
            base.bahavior(e);
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
            if(!C.CTRL.BAHAVIOR){
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