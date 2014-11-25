/**
 * Created by mizi on 2014/11/24.
 */
'use strict';

angular.module('fdf.services.base', [])

.service('$Base', ['app', function(app){
    return {
        /**
         * 判断当前用户是否有权限
         * @param permission => string 待校验的用户权限信息
         * @retuen {boolean}
         */
        permission: function(permission){
            var allPermission = store.get(app.USER_PERMISSION),
                permissionArray = permission.toString().split(","),
                l = permissionArray.length;

            if(l){
                for(var i = 0; i<j; i++ ){
                    if( allPermission[permissionArray[i]]){
                        return true;
                    }
                }

                //TODO 记录用户违权操作记录
                return false;
            }

            return true;
        },

        /**
         * 用户行为记录
         * @param info
         * @param fn
         * @returns {$promise|*}
         */
        bahavior: function(info, fn){
            var res = app.$BaseResource.bahavior.get({
                info: info
            }, fn);

            return res.$promise;
        }


    }
}]);