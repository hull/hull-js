module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');
  // grunt.loadNpmTasks('grunt-dox');

  var port = 3001;

  // ==========================================================================
  // Project configuration
  // ==========================================================================

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    dox: {
      files: {
        src: 'lib/**/*.js',
        dest: 'docs'
      }
    },

    clean: {
      libs: {
        src: ['lib', 'dist']
      },
      widgets: {
        src: ['widgets', 'tmp']
      }
    },

    coffee: {
      compile: {
        options: {
          bare: false,
          header: true
        }
      },
      files: {
        files: grunt.file.expandMapping(['src/**/*.coffee'], 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      }
    },

    connect: {
      server: {
        options: {
          port: port,
          base: '.'
        }
      }
    },

    requirejs: {
      client: {
        options: {
          baseUrl: '.',
          //optimize: 'none',
          preserveLicenseComments: true,
          paths: {
            aura:           'components/aura-express/dist/aura',
            underscore:     'components/underscore/underscore',
            eventemitter:   'components/eventemitter2/lib/eventemitter2',
            backbone:       'components/backbone/backbone',
            easyXDM:        'components/easyXDM/easyXDM',
            handlebars:     'components/handlebars/handlebars',
            requireLib:     'components/requirejs/require',
            jquery:         'empty:',
            text:           'components/requirejs-text/text'
          },
          shim: {
            backbone:   { exports: 'Backbone', deps: ['underscore', 'jquery'] },
            underscore: { exports: '_' },
            easyXDM:    { exports: 'easyXDM' }
          },
          include: [
            'requireLib',
            'underscore',
            'backbone',
            'handlebars',
            'eventemitter',
            'easyXDM',
            'aura',
            'aura-extensions/aura-backbone',
            'aura-extensions/aura-handlebars',
            'handlebars',
            'text',
            'lib/hull',
            'lib/client/api',
            'lib/client/auth',
            'lib/client/templates',
            'lib/client/handlebars-helpers',
            'lib/client/widget',
            'lib/client/storage'
          ],
          out: 'dist/hull.js'
        }
      },
      remote: {
        options: {
          baseUrl: '.',
          optimize: 'none',
          preserveLicenseComments: true,
          paths: {
            aura:               'components/aura-express/dist/aura',
            underscore:         'components/underscore/underscore',
            eventemitter:       'components/eventemitter2/lib/eventemitter2',
            easyXDM:            'components/easyXDM/easyXDM',
            requireLib:         'components/requirejs/require',
            jquery:             'components/jquery/jquery',
            text:               'components/requirejs-text/text',
            'route-recognizer': 'components/route-recognizer/dist/route-recognizer.amd',
            analytics:          'components/analytics/analytics',
            base64:             'components/base64/base64'
          },
          shim: {
            underscore: { exports: '_' },
            analytics: { exports: 'analytics' },
            easyXDM:    { exports: 'easyXDM' }
          },
          include: [
            'requireLib',
            'jquery',
            'underscore',
            'eventemitter',
            'easyXDM',
            'aura',
            'text',
            'base64',
            'analytics',
            'lib/hull-remote',
            'lib/remote/services',
            'lib/remote/services/facebook',
            'lib/remote/services/hull'
          ],
          out: 'dist/hull-remote.js'
        }
      },
      upload: {
        options: {
          paths: {
            jquery: "empty:",
            "jquery.ui.widget" : 'components/jquery-file-upload/js/vendor/jquery.ui.widget',
            "jquery.fileupload" : 'components/jquery-file-upload/js/jquery.fileupload'
          },
          include: [
           'jquery.fileupload'
          ],
          out: 'tmp/widgets/upload/jquery.fileupload.js'
        }
      }
    },

    uglify: {
      widgets: {
        files: {
          'widgets/achieve_button/main.js': "tmp/widgets/achieve_button/main.js",
          'widgets/activity/main.js': 'tmp/widgets/activity/main.js',
          'widgets/comments/main.js': 'tmp/widgets/comments/main.js',
          'widgets/explorer/main.js': 'tmp/widgets/explorer/main.js',
          'widgets/friends_list/main.js': 'tmp/widgets/friends_list/main.js',
          'widgets/identity/main.js': 'tmp/widgets/identity/main.js',
          'widgets/lists/main.js': 'tmp/widgets/lists/main.js',
          'widgets/quiz/main.js': 'tmp/widgets/quiz/main.js',
          'widgets/registration/main.js': 'tmp/widgets/registration/main.js',
          'widgets/reviews/main.js': 'tmp/widgets/reviews/main.js',
          'widgets/upload/main.js': 'tmp/widgets/upload/main.js'
        }
      }
    },

    concat: {
      widgets: {
        options: {
          stripBanners: true
        },
        files: {
          'tmp/widgets/achieve_button/main.js': ['widgets-src/achieve_button/main.js', 'tmp/widgets/achieve_button/templates.js'],
          'tmp/widgets/activity/main.js': ['widgets-src/activity/main.js', 'tmp/widgets/activity/templates.js'],
          'tmp/widgets/comments/main.js': ['widgets-src/comments/main.js', 'tmp/widgets/comments/templates.js'],
          'tmp/widgets/explorer/main.js': ['widgets-src/explorer/main.js', 'tmp/widgets/explorer/templates.js'],
          'tmp/widgets/friends_list/main.js': ['widgets-src/friends_list/main.js', 'tmp/widgets/friends_list/templates.js'],
          'tmp/widgets/identity/main.js': ['widgets-src/identity/main.js', 'tmp/widgets/identity/templates.js'],
          'tmp/widgets/lists/main.js': ['widgets-src/lists/main.js', 'tmp/widgets/lists/templates.js'],
          'tmp/widgets/quiz/main.js': ['widgets-src/quiz/main.js', 'tmp/widgets/quiz/templates.js'],
          'tmp/widgets/registration/main.js': ['widgets-src/registration/main.js', 'tmp/widgets/registration/templates.js'],
          'tmp/widgets/reviews/main.js': ['widgets-src/reviews/main.js', 'tmp/widgets/reviews/templates.js'],
          'tmp/widgets/upload/main.js': [
            'tmp/widgets/upload/jquery.fileupload.js',
            'widgets-src/upload/main.js',
            'tmp/widgets/upload/templates.js'
          ]
        }
      }
    },

    jshint: {
      files: {
        src: ['lib/**/*.js', 'spec/lib/**/*.js']
      },
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        browser: true,
        nomen: false,
        expr: true,
        globals: {
          console: true,
          require: true,
          define: true,
          _: true,
          $: true
        }
      }
    },

    handlebars: {
      widgets: {
        options: {
          wrapped: true,
          namespace: "Hull.templates._default",
          processName: function (filename) {
            return filename.replace("widgets-src/", "").replace(/\.hbs$/, '');
          }
        },
        files: {
          "tmp/widgets/achieve_button/templates.js" : "widgets-src/achieve_button/**/*.hbs",
          "tmp/widgets/activity/templates.js"       : "widgets-src/activity/**/*.hbs",
          "tmp/widgets/comments/templates.js"       : "widgets-src/comments/**/*.hbs",
          "tmp/widgets/explorer/templates.js"       : "widgets-src/explorer/**/*.hbs",
          "tmp/widgets/friends_list/templates.js"   : "widgets-src/friends_list/**/*.hbs",
          "tmp/widgets/identity/templates.js"       : "widgets-src/identity/**/*.hbs",
          "tmp/widgets/lists/templates.js"          : "widgets-src/lists/**/*.hbs",
          "tmp/widgets/quiz/templates.js"           : "widgets-src/quiz/**/*.hbs",
          "tmp/widgets/registration/templates.js"   : "widgets-src/registration/**/*.hbs",
          "tmp/widgets/reviews/templates.js"        : "widgets-src/reviews/**/*.hbs",
          "tmp/widgets/upload/templates.js"         : "widgets-src/upload/**/*.hbs",
        }
      }
    },

    mocha: {
      hull: ['http://localhost:' + port + "/spec/index.html"]
    },

    watch: {
      widgets: {
        files: ['widgets-src/**/*'],
        tasks: ['build_widgets']
      },
      libs: {
        files: ['aura-extensions/**/*.js', 'src/**/*.coffee', 'spec/src/**/*.coffee'],
        tasks: ['build_libs']
      }
    }
  });

  // default build task
  grunt.registerTask('build_libs', ['clean:libs', 'coffee', 'requirejs']);
  grunt.registerTask('build_widgets', ['clean:widgets', 'handlebars', 'requirejs:upload', 'concat:widgets', 'uglify:widgets']);
  grunt.registerTask('build', ['build_libs', 'build_widgets'])
  grunt.registerTask('default', ['connect', 'build', /*'mocha',*/ 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);

};
