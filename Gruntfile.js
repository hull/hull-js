module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-dox');

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

    clean: ['lib','dist'],

    coffee: {
      compile: {
        files: {
          'lib/*.js' : 'src/**/*.coffee'
        },
        options: {
          bare: false,
          header: true
        }
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
            handlebars:     'components/require-handlebars-plugin/Handlebars',
            hbs:            'components/require-handlebars-plugin/hbs',
            i18nprecompile: 'components/require-handlebars-plugin/hbs/i18nprecompile',
            json2:          'components/require-handlebars-plugin/hbs/json2',
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
            'eventemitter',
            'easyXDM',
            'aura',
            'aura-extensions/aura-backbone',
            'aura-extensions/aura-backbone',
            'aura-extensions/aura-handlebars',
            'handlebars',
            'hbs',
            'text',
            'i18nprecompile',
            'json2',
            'lib/hull',
            'lib/client/api',
            'lib/client/auth',
            'lib/client/templates',
            'lib/client/handlebars-helpers',
            'lib/client/widget',
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
            'lib/remote/services/facebook-service',
            'lib/remote/services/hull-service',
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
      hull: {
        src: ['http://localhost:' + port + "/spec/index.html"]
      }
    },

    watch: {
      src: {
        files: ['src/**/*.coffee', 'spec/src/**/*.coffee'],
        tasks: ['build']
      }
    }
  });

  // default build task
  grunt.registerTask('build', ['clean', 'coffee' /*, 'requirejs' */]);
  grunt.registerTask('default', ['connect', 'build', 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);

};
