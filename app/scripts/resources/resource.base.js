/**
 * Created by mizi on 2014/11/24.
 */
'use strict';

angular.module('fdf.resources.base', [])

.service('$BaseResource', ['$resource', function($resource){
    return {
        bahavior: $resource('/bahavior', null, {
            'post': {
                method: 'POST',
                uri: 'bahavior'
            }
        })
    }
}]);