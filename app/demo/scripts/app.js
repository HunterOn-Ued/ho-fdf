(function (window, angular, undefined) {

    'use strict';

    angular.module('demoApp.controllers', [
        'demoApp.controllers.front',
        'demoApp.controllers.candidate'
    ]);

    angular.module('demoApp.config', [
        'demoApp.config.routers'
    ]);

    angular.module('demoApp.services', [
        'demoApp.services.candidate'
    ]);

    angular.module('demoApp.resources', [
        'demoApp.resources.candidate'
    ]);

    angular.module('demoApp.config', [
        'demoApp.config.routers'
    ]);

    angular.module('demoApp', [
        'fdf',
        'demoApp.config',
        'demoApp.controllers',
        'demoApp.services',
        'demoApp.resources'
    ]);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['demoApp']);
    });

})(window, angular);