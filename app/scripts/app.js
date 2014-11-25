/**
 * Created by mizi on 2014/11/11.
 */
'use strict';

angular.module('fdf.resources', [
    'fdf.resources.base'
]);

angular.module('fdf.services', [
    'fdf.services.base'
]);

angular.module('fdf.controllers', [
    'fdf.controllers.front'
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
    'fdf.config.utils',
    'fdf.config.global',
    'fdf.config.setting',
    'fdf.config.routers'
]);

angular.module('fdf', [
    'ngSanitize',
    'ngResource',
    'fdf.config',
    'fdf.filters',
//    'fdf.routers',
    'fdf.directives',
    'fdf.resources',
    'fdf.services',
    'fdf.controllers'
]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['fdf']);
});


