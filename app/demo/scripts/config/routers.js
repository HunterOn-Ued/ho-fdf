(function (window, angular, undefined) {
    'use strict';

    /**
     * router 使用 angular-ui-router
     */
    angular.module('demoApp.config.routers', ['ui.router'])

    .run(['app', '$state', '$stateParams',
        function (app, $state, $stateParams) {
            app.$state = $state;
            app.$stateParams = $stateParams;
        }
    ])

    .config(['app', '$stateProvider', '$urlRouterProvider',
        function (app, $stateProvider, $urlRouterProvider) {

            $urlRouterProvider.when("", "/login")
                .when("/", "/login")
                .otherwise('/404');

            $stateProvider
            /**
             * front display
             * front alias f
             * 前台展示页
             */
                .state('f', {
                    url: '/front',
                    views: {
                        'front@': {
                            templateUrl: '/demo/views/front.html',
                            controller: ['app', function (app) {
                                app.$rootScope.area = app.AREA_FRONT;
                            }]
                        }
                    }
                })

                //front -> login 登录页
                .state('f.login', {
                    url: '^/login',
                    views: {
                        '@f': {
                            templateUrl: '/demo/views/front/login.html',
                            controller: 'FrontLoginCtrl as login'
                        }
                    }
                })

                // front -> resume
                .state('f.resume', {
                    url: '^/resume',
                    views: {
                        '@f': {
                            templateUrl: '/demo/views/front/resume.html',
                            controller: 'FrontResumeCtrl as resume'
                        }
                    }
                })

                // front -> search
                .state('f.search', {
                    url: '^/search',
                    views: {
                        '@f': {
                            templateUrl: function (stateParam) {
                                return '/demo/views/front/search.html';
                            },
                            controller: 'FrontSearchCtrl as search'
                        }
                    }
                })

            /**
             * back-end management
             * backend alias b
             * 后端管理页
             */

                .state('b', {
                    url: '^/backend',
                    views: {
                        'backend@': {
                            templateUrl: '/demo/views/backend.html',
                            controller: ['app', function (app) {
                                app.$rootScope.area = app.AREA_BACKEND;
                            }]
                        }
                    }
                })

            /**
             * layout 1-1-1
             * backend.main alias b.m
             * 左中右三列布局模式
             */
                .state('b.m', {
                    url: '^/backend/main',
                    views: {
                        'main@b': {
                            templateUrl: '/demo/views/backend/layout.html',
                            controller: ['app', function (app) {
                                app.$rootScope.layout = app.LAYOUT_DOUBLE;
                            }]
                        }
                    }
                })

                //候选人页
                .state('b.m.candidate', {
                    url: '^/candidate',
                    views: {
                        'list@b.m': {
                            templateUrl: '/demo/views/backend/candidate/candidate.list.html',
                            controller: 'CandidateListCtrl as cdds'
                        }
                    }
                })

                // 查看候选人detail
                .state('b.m.candidate.detail', {
                    url: '^/candidate/:id',
                    views: {
                        'detail@b.m': {
                            templateUrl: '/demo/views/backend/candidate/candidate.detail.html',
                            controller: 'CandidateDetailCtrl as cdd'
                        }
                    }
                })

                // 查看候选人detail 单页显示
                .state('b.m.candidate.detail.single', {
                    url: '^/candidate/{id}/{layout}',
                    views: {
                        'main@b': {
                            templateUrl: '/demo/views/backend/candidate/candidate.detail.html',
                            controller: 'CandidateDetailCtrl as cdd'
                        }
                    }
                });
        }
    ]);

})(window, angular);