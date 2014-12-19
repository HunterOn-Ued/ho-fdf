(function (window, angular, undefined) {

    'use strict';

    angular.module('demoApp.controllers', [
        'demoApp.controllers.front'
    ]);

    angular.module('demoApp.config', [
        'fdf.config.routers'
    ]);

    angular.module('demoApp', [
        'fdf',
        'demoApp.config',
        'demoApp.controllers'
    ]);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['demoApp']);
    });

})(window, angular);