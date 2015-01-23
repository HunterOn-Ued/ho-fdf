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
