module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
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
      files: {
        src: ['lib', 'dist']
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
          out: 'dist/hull.js'
        }
      },
      remote: {
        options: {
          baseUrl: '.',
          // optimize: '',
          preserveLicenseComments: true,
          paths: {
            aura:         'components/aura-express/dist/aura',
            underscore:   'components/underscore/underscore',
            eventemitter: 'components/eventemitter2/lib/eventemitter2',
            easyXDM:      'components/easyXDM/easyXDM',
            requireLib:   'components/requirejs/require',
            jquery:       'components/jquery/jquery',
            text:           'components/requirejs-text/text',
            'route-recognizer': 'components/route-recognizer/dist/route-recognizer.amd'
          },
          shim: {
            underscore: { exports: '_' },
            easyXDM:    { exports: 'easyXDM' }
          },
          include: [
            'requireLib',
            'underscore',
            'eventemitter',
            'easyXDM',
            'aura',
            'text',
            'lib/hull-remote',
            'lib/remote/services',
            'lib/remote/services/facebook',
            'lib/remote/services/hull'
          ],
          out: 'dist/hull-remote.js'
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


    mocha: {
      hull: ['http://localhost:' + port + "/spec/index.html"]
    },

    watch: {
      src: {
        files: ['aura-extensions/**/*.js', 'src/**/*.coffee', 'spec/src/**/*.coffee'],
        tasks: ['build']
      }
    }
  });

  // default build task
  grunt.registerTask('build', ['clean', 'coffee', 'requirejs']);
  grunt.registerTask('default', ['connect', 'build', /*'mocha',*/ 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);

};
