'use strict';

angular.module('fdf.controllers.candidate', [])

.controller('CandidateListCtrl',['app', function(app){
    var vm = this;

    app.$_Candidate.list.get({}, function(res){
        vm.list = res.data;
        console.debug(res.data);
    });

}]);