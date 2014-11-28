/**
 * Created by mizi on 2014/11/24.
 */
'use strict';

angular.module('fdf.resources.candidate', [])

.service('$_Candidate', ['$resource', function($resource){
    return {
        list: $resource('/store/test/candidates.json'),
        detail: $resource('/store/test/candidate.json')
    }
}]);