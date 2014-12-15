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
        ICON: 'images/hd64.png'
    }
})

//设置全局变量
.constant('app', {
    version: '0.1.0'
});

;})(window, angular);
