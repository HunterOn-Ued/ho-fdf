'use strict';

/**
 * router 使用 angular-ui-router
 */
angular.module('fdf.config.routers', ['ui.router'])

.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
])

.config(['app', '$stateProvider', '$urlRouterProvider',
    function(app, $stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            /**
             * front display
             * 前台展示页
             */
            .state('front', {
                url: '/front',
                views: {
                    'front@': {
                        templateUrl: 'views/front.html'
                    }
                }
            })

            //登录页
            .state('front.login',{
                url: '^/login',
                views: {
                    '@front': {
                        templateUrl: 'views/front/login.html',
                        controller: 'FrontLoginCtrl as login'
                    }
                }
            })

            // front resume moudle
            .state('front.resume',{
                url: '^/resume',
                views: {
                    '@front': {
                        templateUrl: 'views/front/resume.html',
                        controller: 'FrontResumeCtrl as resume'
                    }
                }
            })

            // front resume search
            .state('front.search',{
                url: '^/search',
                views: {
                    '@front': {
                        templateUrl: function(stateParam){
                            return 'views/front/search.html';
                        },

                        controller: 'FrontSearchCtrl as search'

                    }
                }
            })

            /**
             * back-end management
             * 后端管理页
             */

            .state('backend', {
                url: '/backend',
                views: {
                    'backend@': {
                        templateUrl: '../../views/backend.html'
                    }
                }
            })

            //候选人页
            .state('backend.candidate',{
                url: '^/candidate',
                views: {
                    'main@backend': {
                        template: '<a ui-sref-active="active" ui-sref="front.login">cdd to login page</a>'
                    }
                }
            })

        ;
    }
]);