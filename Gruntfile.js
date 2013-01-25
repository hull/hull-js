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

  var widgetsList = grunt.file.glob.sync('widgets/*');
  var pkg         = grunt.file.readJSON('component.json');

  var uglifyWidgetsFiles      = {},
      concatWidgetsFiles      = {},
      handlebarsWidgetsFiles  = {};

  widgetsList.forEach(function(widgetPath) {
    uglifyWidgetsFiles['dist/' + pkg.version + '/' + widgetPath + '/main.js'] = 'tmp/' + widgetPath + '/main.js';
    concatWidgetsFiles['tmp/' + widgetPath + '/main.js'] = [widgetPath + '/main.js', 'tmp/' + widgetPath + '/templates.js'];
    handlebarsWidgetsFiles['tmp/' + widgetPath + '/templates.js'] = widgetPath + '/**/*.hbs';
  });

  grunt.initConfig({

    pkg: pkg,

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
        src: ['tmp']
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
          wrap: {
            start: "(function() { var __version__ = '" + pkg.version + "';",
            end: " ; window.require = require; window.define = define; }(window));"
          },
          baseUrl: '.',
          // optimize: 'none',
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
            text:           'components/requirejs-text/text',
            "jquery.fileupload": 'components/jquery-file-upload/js/jquery.fileupload',
            "jquery.ui.widget":  'components/jquery-file-upload/js/vendor/jquery.ui.widget'
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
            'jquery.fileupload',
            'jquery.ui.widget',
            'lib/hull',
            'lib/client/api',
            'lib/client/auth',
            'lib/client/templates',
            'lib/client/handlebars-helpers',
            'lib/client/widget',
            'lib/client/storage'
          ],
          out: 'dist/' + pkg.version + '/hull.js'
        }
      },
      remote: {
        options: {
          wrap: {
            start: "(function() { var __version__ = '" + pkg.version + "';",
            end: " ; window.require = require; window.define = define; }(window));"
          },
          baseUrl: '.',
          // optimize: 'none',
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
          out: 'dist/' + pkg.version + '/hull-remote.js'
        }
      }
    },

    uglify: {
      widgets: {
        options: {
          mangle: false,
          beautify: true,
          compress: false
        },
        files: uglifyWidgetsFiles
      }
    },

    concat: {
      widgets: {
        options: {
          stripBanners: true
        },
        files: concatWidgetsFiles
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
            return filename.replace("widgets/", "").replace(/\.hbs$/, '');
          }
        },
        files: handlebarsWidgetsFiles
      }
    },

    mocha: {
      hull: ['http://localhost:' + port + "/spec/index.html"]
    },

    watch: {
      widgets: {
        files: ['widgets/**/*'],
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
  grunt.registerTask('build_widgets', ['clean:widgets', 'handlebars', 'concat:widgets', 'uglify:widgets']);
  grunt.registerTask('build', ['build_libs', 'build_widgets']);
  grunt.registerTask('default', ['connect', 'build', /*'mocha',*/ 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);
};
