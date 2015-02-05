(function (window, angular, undefined) {
    'use strict';

    angular.module('fdf.directives.base', [])

    .directive('fdfLink', ['app', function(app){
        return {
            restrict: 'AC',
            transclude: false,
            link: function(scope, elm, attr){
                elm.bind('click', function(e){
                    app.$Base.event({
                        e: e,
                        name: attr.fdfLink,
                        scope: scope,
                        isChangePage: attr.fdfPage === "true"
                    });
                });
            }
        }
    }])

    .directive('fdfBtn', ['app', function(app){
        return {
            restrict: 'AC',
            transclude: false,
            priority: -100,
            link: function(scope, element, attr){

                // 禁止双金事件
                element.on('dblclick', function(e){
                    app.$log.log(':::double click:::');
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                });

                // 绑定点击事件，防止双击触发
                element.on('click', function(e){
                    app.$timeout(function(){
                        attr.$set('disabled', 'true');
                        attr.$set('ngDisabled', 'true');
                        element.addClass('loading');
                        if(!element.find('span.loading').length){
                            element.html('<span>' + element.html() + '</span><span class="loading">Loading...</span>');
                        }
                    }, 0);
                    return false;
                });

                // 禁用disabled
                if( attr.ngDisabled ){
                    element.addClass('disabled');
                }else if(element[0].disabled){
                    element.addClass('disabled');
                }else if( element.hasClass('disabled') ){
                    attr.$set('disabled', 'true');
                    attr.$set('ngDisabled', 'true');
                }
            }
        }
    }])




})(window, angular);