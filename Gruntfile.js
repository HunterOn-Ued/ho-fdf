'use strict';

//expand：如果设为true，就表示下面文件名的占位符（即*号）都要扩展成具体的文件名。
//cwd：需要处理的文件（input）所在的目录。
//src：表示需要处理的文件。如果采用数组形式，数组的每一项就是一个文件名，可以使用通配符。
//dest：表示处理后的文件名或所在目录。
//ext：表示处理后的文件后缀名。

//*：匹配任意数量的字符，不包括/。
//?：匹配单个字符，不包括/。
//**：匹配任意数量的字符，包括/。
//{}：允许使用逗号分隔的列表，表示“or”（或）关系。
//!：用于模式的开头，表示只返回不匹配的情况。

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var appConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        config: appConfig,

//        bower: {
//            install: {
//                options: {
//                    targetDir: '<%= config.app %>/lib',
//                    install: true,
//                }
//            }
//        },

        //监控页面改变
        watch: {
            options: {
                livereload: true
            },

            bower: {
                files: ['bower.json']
            },
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            sass: {
                files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass:server']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/{,**/}*.html',
                    '<%= config.app %>/{,**/}*.js',
                    '<%= config.app %>/{,**/}*.css'
                ]
            },
            html: {
                files: [
                    '<%= config.app %>/{,*/}*.html'
                ]
            }
        },

        connect: {
            options: {
                port: 9090,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'fdf.hunteron.com',
                livereload: 35730
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect.static(appConfig.app)
                        ];
                    }
                }
            }
        },

        // build前清空文件夹
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= config.dist %>/*',
                            '!<%= config.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // 代码风格检测
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass: {

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/styles',
                        src: ['*.scss'],
                        dest: '.tmp/styles',
                        ext: '.css'
                    }
                ]
            },
            server: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/styles',
                        src: ['*.scss'],
                        dest: '<%= config.app %>/styles',
                        ext: '.css'
                    }
                ]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/styles/',
                        src: '{,*/}*.css',
                        dest: '.tmp/styles/'
                    }
                ]
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '<%= config.dist %>/images/{,*/}*.*',
                        '<%= config.dist %>/styles/fonts/{,*/}*.*',
                        '<%= config.dist %>/*.{ico,png}'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '<%= config.app %>/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/images',
                        src: '{,*/}*.{gif,jpeg,jpg,png}',
                        dest: '<%= config.dist %>/images'
                    }
                ]
            }
        },

        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/images',
                        src: '{,*/}*.svg',
                        dest: '<%= config.dist %>/images'
                    }
                ]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.dist %>',
                        src: '{,*/}*.html',
                        dest: '<%= config.dist %>'
                    }
                ]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'compass:server'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist',
                'imagemin',
                'svgmin'
            ]
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%= config.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= config.app %>/images',
                javascriptsDir: '<%= config.app %>/scripts',
                fontsDir: '<%= config.app %>/styles/fonts',
                importPath: '<%= config.app %>/lib',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= config.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: false
                }
            }
        }

    });

    grunt.registerTask('bower', ['bower']);

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('mizi', [
        'clean:server',
        'connect:livereload',
        'watch:livereload'
    ]);

};