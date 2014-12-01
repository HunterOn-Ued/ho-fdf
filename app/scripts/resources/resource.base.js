(function (window, angular, undefined) {
'use strict';

angular.module('fdf.resources.base', [])

.service('$_Base', ['$resource', function ($resource) {
    return {
        bahavior: $resource('/bahavior', null, {
            'post': {
                method: 'POST',
                uri: 'bahavior'
            }
        })
    }
}]);

})(window, angular);