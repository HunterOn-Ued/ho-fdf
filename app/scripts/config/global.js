'use strict';

angular.module('fdf.config.global', [])

//设置全局常量
.constant('constant', {
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
    }
})

//设置全局变量
.constant('app', {
    version: '0.1.0'
});