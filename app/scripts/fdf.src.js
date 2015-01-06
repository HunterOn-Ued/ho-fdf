require('./plusin/mu.js');
require('./config/global.js');
require('./config/setting.js');
require('./utils/utils.js');
require('./resources/resource.base.js');
require('./services/service.base.js');

(function(window, angular, undefined){
    'use strict';

    angular.module('fdf.resources', [
        'fdf.resources.base'
    ]);

    angular.module('fdf.services', [
        'fdf.services.base'
    ]);

    angular.module('fdf.controllers', [
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
        'fdf.config.setting'
    ]);

    angular.module('fdf', [
        'ngSanitize',
        'ngResource',
        'fdf.config',
        'fdf.filters',
        'fdf.directives',
        'fdf.resources',
        'fdf.services',
        'fdf.controllers'
    ]);

})(window, angular);





