(function (window, angular, undefined) {
    'use strict';

    angular.module('demoApp.resources.candidate', [])

        .service('$_Candidate', ['$resource', function ($resource) {
            return {
                list: $resource('store/candidates.json')
            }
        }]);

})(window, angular);