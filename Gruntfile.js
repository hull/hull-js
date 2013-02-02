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

  widgetsList.forEach(function (widgetPath) {
    uglifyWidgetsFiles['dist/' + pkg.version + '/' + widgetPath + '/main.js'] = 'tmp/' + widgetPath + '/main.js';
    concatWidgetsFiles['tmp/' + widgetPath + '/main.js'] = ['tmp/' + widgetPath + '/deps/*.js', widgetPath + '/main.js', 'tmp/' + widgetPath + '/templates.js'];
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
        src: ['lib']
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
          baseUrl: '.',
          preserveLicenseComments: true,
          paths: {
            aura:           'components/aura-express/dist',
            underscore:     'components/underscore/underscore',
            eventemitter:   'components/eventemitter2/lib/eventemitter2',
            backbone:       'components/backbone/backbone',
            easyXDM:        'components/easyXDM/easyXDM',
            handlebars:     'components/handlebars/handlebars',
            requireLib:     'components/requirejs/require',
            moment:         'components/moment/moment',
            string:         'components/underscore.string/dist/underscore.string.min',
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
            'easyXDM',
            'text',
            'lib/hull'
          ],
          out: 'dist/' + pkg.version + '/hull.js'
        }
      },
      remote: {
        options: {
          baseUrl: '.',
          // optimize: 'none',
          preserveLicenseComments: true,
          paths: {
            aura:               'components/aura-express/dist',
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
            'text',
            'base64',
            'analytics',
            'lib/hull-remote',
            'lib/remote/services',
            'lib/remote/services/hull',
            'lib/remote/services/facebook'
          ],
          out: 'dist/' + pkg.version + '/hull-remote.js'
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
          out: 'tmp/widgets/upload/deps/jquery.fileupload.js'
        }
      },
      registration: {
        options: {
          paths: {
            jquery: "empty:",
            "jquery.default_fields" : "widgets/registration/default_fields",
            "jquery.h5validate": "widgets/registration/jquery.h5validate"
          },
          include: [
            'jquery.default_fields',
            'jquery.h5validate'
          ],
          out: 'tmp/widgets/registration/deps/jquery.deps.js'
        }
      }
    },

    uglify: {
      widgets: {
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
    },
    template: {
      template: "define(function () { return '<%= pkg.version %>';});",
      dest: 'lib/version.js'     
    }
  });

  // default build task
  grunt.registerTask('build_libs', ['clean:libs', 'coffee', 'template', 'requirejs:client', 'requirejs:remote']);
  grunt.registerTask('build_widgets', ['clean:widgets', 'handlebars', 'requirejs:upload', 'requirejs:registration', 'concat:widgets', 'uglify:widgets']);
  grunt.registerTask('build', ['build_libs', 'build_widgets']);
  grunt.registerTask('default', ['connect', 'build', /*'mocha',*/ 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);


  grunt.registerTask("template", "generate a file from a template", function () {
    var conf = grunt.config("template");
    grunt.file.write(conf.dest, grunt.template.process(conf.template));
    grunt.log.writeln('Generated \'' + conf.dest + '\' successfully.');  
  });
};
