(function (window, angular, undefined) {

'use strict';

angular.module('demoApp.controllers.front', [])

/**
* front login
*/
.controller('FrontLoginCtrl', ['app', function (app) {
    var vm = this;
    app.$rootScope.module = 'login';
    vm.email = 'amily4555@gmail.com';
    vm.test = function ($event, name) {
        app._evt($event);
    };

    var a = [1, 2, 3, 3, 4];
    var b = {'s':1};


    return vm;
}])


/**
* front resume
*/
.controller('FrontResumeCtrl', ['app', function (app) {
    app.$rootScope.module = 'resume';
}])

/**
* front search
*/
.controller('FrontSearchCtrl', ['app', function (app) {
    app.$rootScope.module = 'search';
}]);

})(window, angular);