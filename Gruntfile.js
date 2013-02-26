module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-hull-dox');
  grunt.loadNpmTasks('grunt-hull-widgets');
  grunt.loadNpmTasks('grunt-s3');

  var pkg = grunt.file.readJSON('component.json');
  var aws = grunt.file.readJSON('grunt-aws.json');
  var port = 3001;

  // ==========================================================================
  // Project configuration
  // ==========================================================================

  var pkg         = grunt.file.readJSON('component.json');
  var clientSrc = ['src/hullbase.coffee', 'src/hull.coffee', 'src/client/**/*.coffee'];
  var remoteSrc = ['src/hullbase.coffee', 'src/hull-remote.coffee', 'src/remote/**/*.coffee'];

  //
  // Lookup of the available libs and injects them for the build
  // in the requirejs conf
  var clientLibs = grunt.file.glob
    .sync('src/client/**/*.coffee')
    .map(function (clientLib) {
      return clientLib.replace('.coffee', '').replace('src/', 'lib/');
    });

  var remoteLibs = grunt.file.glob
    .sync('src/remote/**/*.coffee')
    .map(function (clientLib) {
      return clientLib.replace('.coffee', '').replace('src/', 'lib/');
    });

  // Lookup of the Aura Extensions and injects them in the requirejs build
  var auraExtensions = grunt.file.glob
    .sync('aura-extensions/**/*.js')
    .map(function (extension) {
      return extension.replace('.js', '');
    });


  grunt.initConfig({
    pkg: pkg,
    clean: {
      client: {
        src: clientLibs
      },
      remote: {
        src: remoteLibs
      }
    },
    aws: aws,
    s3: {
      key: '<%= aws.key %>',
      secret: '<%= aws.secret %>',
      bucket: '<%= aws.bucket %>',
      access: 'public-read',
      // debug: true,
      options:{
        encodePaths: true,
        maxOperations: 20
      },
      upload: [
        {
          src: 'dist/'+pkg.version+'/**',
          dest: '/',
          rel: 'dist/'
        }
      ]
    },
    dox: {
      files: {
        src: 'widgets/**/main.js',
        dest: 'dist/' + pkg.version + '/docs'
      }
    },
    coffee: {
      compile: {
        options: {
          header: true
        }
      },
      remote: {
        files: grunt.file.expandMapping(remoteSrc, 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      },
      client: {
        files: grunt.file.expandMapping(clientSrc, 'lib/', {
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
            aura:           'components/aura/dist',
            underscore:     'components/underscore/underscore',
            eventemitter:   'components/eventemitter2/lib/eventemitter2',
            backbone:       'components/backbone/backbone',
            easyXDM:        'components/easyXDM/easyXDM',
            handlebars:     'components/handlebars/handlebars',
            requireLib:     'components/requirejs/require',
            moment:         'components/moment/moment',
            string:         'components/underscore.string/lib/underscore.string',
            jquery:         'empty:',
            text:           'components/requirejs-text/text'
          },
          shim: {
            backbone:   { exports: 'Backbone', deps: ['underscore', 'jquery'] },
            string:     { exports: '_', deps: ['underscore'] },
            underscore: { exports: '_' },
            easyXDM:    { exports: 'easyXDM' },
            handlebars:    { exports: 'Handlebars' }
          },
          include: [
            'requireLib',
            'underscore',
            'moment',
            'string',
            'backbone',
            'handlebars',
            'easyXDM',
            'text',
            'lib/hull'
          ].concat(auraExtensions)
           .concat(clientLibs),
          out: 'dist/' + pkg.version + '/hull.js'
        }
      },
      remote: {
        options: {
          baseUrl: '.',
          // optimize: 'none',
          preserveLicenseComments: true,
          paths: {
            aura:               'components/aura/dist',
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
            'lib/remote/services/facebook',
            'lib/remote/services/github'
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
            "h5f": "widgets/registration/h5f"
          },
          include: [
            'jquery.default_fields',
            'h5f'
          ],
          out: 'tmp/widgets/registration/deps/jquery.deps.js'
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
        src: ["spec/index.html"]
      }
    },
    watch: {
      widgets: {
        files: ['widgets/**/*'],
        tasks: ['hull_widgets']
      },
      remote: {
        files: remoteSrc,
        tasks: ['build_remote']
      },
      client: {
        files: clientSrc,
        tasks: ['build_client']
      },
      compass: {
        files: [
          'stylesheets/**/*.{scss,sass}'
        ],
        tasks: 'compass:dev'
      }
    },
    version: {
      template: "define(function () { return '<%= pkg.version %>';});",
      dest: 'lib/version.js'
    },
    compass: {
      dev: {
        options: {
          sassDir: 'stylesheets',
          cssDir: 'dist/' + pkg.version,
          outputStyle: 'expanded',
          noLineComments: false,
          force: true,
          debugInfo: true,
          imagesDir: 'assets/images',
          relativeAssets: true
        },
      },
      prod: {
        options: {
          sassDir: 'stylesheets',
          cssDir: 'dist/' + pkg.version,
          outputStyle: 'compressed',
          noLineComments: true,
          force: true,
          debugInfo: false,
          imagesDir: 'assets/images',
          relativeAssets: false
        },
      }
    },
    hull_widgets: {
      hull: {
        src: 'widgets',
        // before: ['requirejs:upload', 'requirejs:registration'],
        dest: 'dist/<%= pkg.version%>/widgets'
      }
    }
  });

  // default build task
  grunt.registerTask('build_remote', ['clean', 'coffee:remote', 'version', 'requirejs:remote']);
  grunt.registerTask('build_client', ['clean', 'coffee:client', 'version', 'requirejs:client']);
  grunt.registerTask('build_libs', ['build_client', 'build_remote']);
  grunt.registerTask('build', ['build_libs', 'hull_widgets', 'compass:prod']);
  grunt.registerTask('default', ['connect', 'build', /*'mocha'*/ 'watch']);
  grunt.registerTask('dist', ['build', 'dox']);
  grunt.registerTask('deploy', ['dist', 's3']);

  grunt.registerTask("version", "generate a file from a template", function () {
    var conf = grunt.config("version");
    grunt.file.write(conf.dest, grunt.template.process(conf.template));
    grunt.log.writeln('Generated \'' + conf.dest + '\' successfully.');
  });
};
