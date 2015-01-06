(function (window, angular, undefined) {

'use strict';

angular.module('demoApp.controllers.candidate', [])

.run(['app', function(app){
    app.$Candidate = app.$injector.get('$Candidate');
    app.$_Candidate = app.$injector.get('$_Candidate');
}])

.controller('CandidateListCtrl', ['app', function (app) {
    var vm = this;

    app.$_Candidate.list.get({}, function (res) {
        vm.list = res.data;
    });
}])

.controller('CandidateDetailCtrl', ['app', function (app) {
    var vm = this;
    var stateParams = app.$stateParams;

    console.debug(stateParams);

    app.run(stateParams.layout, function () {
        app.$rootScope.layout = stateParams.layout == app.LAYOUT_SINGLE ? app.LAYOUT_SINGLE : app.LAYOUT_DOUBLE;
    });

    app.$_Candidate.detail.get({}, function (res) {
        vm.detail = res.data.candidate;
    });

}]);

})(window, angular);