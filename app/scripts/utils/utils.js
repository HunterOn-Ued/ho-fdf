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

}]);

})(window, angular);