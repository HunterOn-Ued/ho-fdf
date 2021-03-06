require('./plusin/mu.js');
require('./config/global.js');
require('./config/setting.js');
require('./directives/base.directive.js');
require('./filters/base.filter.js');
require('./resources/base.res.js');
require('./services/base.serv.js');

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
      'fdf.filters.base'
    ]);

    angular.module('fdf.directives', [
      'fdf.directives.base'
    ]);

    angular.module('fdf.config', [
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





