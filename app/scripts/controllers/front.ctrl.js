'use strict';

angular.module('fdf.controllers.front', [])

/**
 * front login
 */
.controller('FrontLoginCtrl',['app', function(app){
    //https://github.com/bvaughn/angular-form-for
    var vm = this;
    app.$rootScope.module = 'login';
    vm.email = 'amily4555@gmail.com';
    vm.test = function($event, name){
        app.evt($event);
    };



    return vm;
}])


/**
 * front resume
 */
.controller('FrontResumeCtrl',['app', function(app){
    app.$rootScope.module = 'resume';
}])

/**
 * front search
 */
.controller('FrontSearchCtrl',['app', function(app){
    app.$rootScope.module = 'search';
}]);