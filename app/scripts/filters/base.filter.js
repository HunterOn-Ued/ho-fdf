(function(window, angular, undefined){
'use strict';

/*
 * 过滤器
 */
angular.module('fdf.filters.base', [])

/*
 * 时间格式化(文本)
 * @params String date 符合时间格式的字符串
 * @params format 格式化类型 || 'yyyy-MM-dd'
 * @return String;
 * @extend $filter('date')
 */

/**
 exp.
 {{ '2013-04-21 00:00:00' | mdate:'yyyy-MM-dd' }} => 2013-04-21
 {{ '1232221221' | mdate:'yyyy年' }} => 2013年
 {{ '21/04/2013 00:00:00' | mdate }} => 2013-04-21
 {{ '21/04/2013 00:00:00' | 'eeee' }} => 星期一
 {{ '21/04/2013 00:00:00' | 'ee' }} => 周一
 */

.filter('fdfDate', ['$filter',
    function($filter) {
        return function(date, format) {
            if (!date) {
                return;
            }

            var eeee = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var ee = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
            var dateVal = $filter('date')(new Date(date), format || 'yyyy-MM-dd');
            var day = new Date(date).getDay();
            if(dateVal.indexOf('eeee')>-1){
                dateVal = dateVal.replace(/eeee/g, eeee[day]);
            }else if(dateVal.indexOf('ee')>-1){
                dateVal = dateVal.replace(/ee/g, ee[day]);
            }

            return dateVal;
        };
    }
]);

})(window, angular);