(function (window, angular, undefined) {
'use strict';

angular.module('fdf.services.base', [])

    .service('$Base', ['app', function (app) {
        var base = {};

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
         * @param currentUser
         */
        base.bahavior = function (e, currentUser) {

            var useInfo = {
                name: currentUser.trueName,
                id: currentUser.id,
                os: '',
                browser: '',
                ip: '',
                loginTime: '',
                useTime: app.timestamp()
            };

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

            // 向后端传递
            app.$_Base.bahavior.post({
                data: {
                    useInfo: useInfo,
                    evtInfo: evtInfo
                }
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

            return new Notification(title,{
                icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
                body: "Hey there! You've been notified!"
            });
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