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
      compile: {
        options: {
          baseUrl: '.',
          optimize: 'none',
          preserveLicenseComments: true,
          paths: {
            aura:         'lib',
            jquery:       'components/jquery/jquery',
            underscore:   'components/underscore/underscore',
            eventemitter: 'components/eventemitter2/lib/eventemitter2'
          },
          shim: {
            underscore: { exports: '_' }
          },
          include: ['aura/aura', 'aura/ext/debug', 'aura/ext/pubsub', 'aura/ext/widgets'],
          exclude: ['jquery'],
          out: 'dist/aura.js'
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
          $: true,
        }
      }
    },


    mocha: {
      aura: {
        src: ['http://localhost:' + port + "/spec/index.html"]
      }
    },

    watch: {
      src: {
        files: ['src/**/*.coffee', 'spec/src/**/*.coffee'],
        tasks: ['coffee']
      }
    }
  });

  // default build task
  grunt.registerTask('build', ['clean', 'coffee'/*,'jshint' , 'mocha', 'requirejs' */]);
  grunt.registerTask('default', ['connect', 'build', 'watch']);
  grunt.registerTask('dist', ['connect', 'build']);

};
