'use strict';

angular.module('fdf.config.utils', [])

.constant('utils', {
    version: '0.3.0'
})

//用户工具类
.run(['utils', function(utils){
    /**
     * underscroe 中文文档
     * http://www.css88.com/doc/underscore/
     */
    utils = angular.extend(utils, _);

    /**
     * 匿名函数输出
     * @param condition
     * @param fn
     * @param fn1
     * @returns {*}
     */
    utils.run = function(condition, fn, fn1 ){
        if(utils.isFunction(condition)){
            return condition();
        }else{
            return condition ? fn() : fn1 ? fn1() : null;
        }
    };

    /**
     * 本地localStroage 存储读取
     * @param key
     * @param val
     */
    utils.storage = function(key, val){
        return utils.run(val == null, function(){
            var _val = localStorage.getItem(key);
            if(typeof _val != 'string' ){
                return undefined;
            }

            try{
                return JSON.parse(_val);
            }catch(e){
                return _val || undefined;
            }

        }, function(){
            localStorage.setItem(key, JSON.stringify(val));
        });
    };

}]);