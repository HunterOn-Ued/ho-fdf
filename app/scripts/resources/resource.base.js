/**
 * Created by mizi on 2014/11/24.
 */
'use strict';

angular.module('fdf.resources.base', [])

.value('uri', {
    hd: function(url){
        return "sss" + url;
    }
})

.service('$BaseResource', ['uri', '$resource', function(uri, $resource){
    return {
        bahavior: $resource(uri.hd('/bahavior'))
    }
}]);