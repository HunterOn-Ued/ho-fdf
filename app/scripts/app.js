(function (window, angular, undefined) {

'use strict';

angular.module('fdf.resources', [
    'fdf.resources.base'
]);

angular.module('fdf.services', [
    'fdf.services.base'
]);

angular.module('fdf.controllers', [
    'b.controllers.front'
]);

angular.module('fdf.filters', [
//    'fdf.filters.string',
//    'fdf.filters.data',
//    'fdf.filters.array',
//    'fdf.filters.math'
]);

angular.module('fdf.directives', [
//    'fdf.directives.dom',
//    'fdf.directives.ui',
//    'fdf.directives.widget'
]);

angular.module('fdf.config', [
    'fdf.config.global',
    'fdf.config.setting',
    'fdf.config.routers'
]);

angular.module('fdf', [
    'ngSanitize',
    'ngResource',
    'fdf.config',
    'fdf.resources',
    'fdf.services',
    'fdf.filters',
    'fdf.directives',
    'fdf.controllers'
]);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['fdf']);
});

})(window, angular);