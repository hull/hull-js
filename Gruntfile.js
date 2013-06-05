module.exports = function (grunt) {
  'use strict';

  var CONTEXT = process.env.CONTEXT || 'prod';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hull-dox');
  grunt.loadNpmTasks('grunt-hull-widgets');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-coverjs');
  grunt.loadNpmTasks('grunt-plato');

  var pkg = grunt.file.readJSON('bower.json');
  var clientConfig = grunt.file.readJSON('config/client.json');
  var remoteConfig = grunt.file.readJSON('config/remote.json');

  var port = 3001;

  // ==========================================================================
  // Project configuration
  // ==========================================================================

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

  var clientRJSConfig = (function () {
    var _c = clientConfig.requireJS;
    _c.include = _c.include.concat(auraExtensions).concat(clientLibs);
    _c.optimize = CONTEXT !== "prod" ? "none" : "uglify";
    return _c;
  })();

  var remoteRJSConfig = (function () {
    var _c = remoteConfig.requireJS;
    _c.include = _c.include.concat(remoteLibs);
    _c.optimize = CONTEXT !== "prod" ? "none" : "uglify";
    return _c;
  })();


  var gruntConfig = {
    PKG_VERSION: pkg.version,
    clean: {
      client: {
        src: 'lib/client/**/*'
      },
      remote: {
        src: 'lib/remote/**/*'
      },
      reset: {
        src: ['build', 'lib', 'tmp', 'dist', 'components', 'node_modules']
      }
    },
    dox: {
      files: {
        baseDir: 'widgets',
        src: 'widgets/**/main.js',
        dest: 'dist/<%= PKG_VERSION %>/docs'
      }
    },
    coffee: {
      compile: {
        options: {
          header: true
        }
      },
      remote: {
        files: grunt.file.expandMapping(remoteConfig.srcFiles, 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      },
      client: {
        files: grunt.file.expandMapping(clientConfig.srcFiles, 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      }
    },
    connect: {
      server: {
        options: {
          port: port
        }
      }
    },
    requirejs: {
      client: {
        options: clientRJSConfig
      },
      remote: {
        options: remoteRJSConfig
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
          paths: { h5f: 'widgets/registration/h5f' },
          shim: { h5f: { exports: 'H5F' } },
          include: ['h5f'],
          out: 'tmp/widgets/registration/deps.js'
        }
      },
      dox: {
        options: {
          paths: { prism: 'widgets/dox/dox/prism' },
          shim: { prism: { exports: 'Prism' } },
          include: ['prism'],
          out: 'tmp/widgets/dox/dox/deps.js'
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
        files: remoteConfig.srcFiles,
        tasks: ['build_remote', 'cover', 'plato', 'mocha']
      },
      client: {
        files: clientConfig.srcFiles,
        tasks: ['build_client', 'cover', 'plato', 'mocha']
      },
      spec: {
        files: ['spec/**/*.js'],
        tasks: ['mocha']
      }
    },
    version: {
      template: "define(function () { return '<%= PKG_VERSION %>';});",
      dest: 'lib/version.js'
    },
    hull_widgets: {
      hull: {
        src: 'widgets',
        before: ['requirejs:upload', 'requirejs:registration', 'requirejs:dox'],
        dest: 'dist/<%= PKG_VERSION%>',
        optimize: CONTEXT === 'prod'
      }
    },
    describe: {
      out: 'dist/<%= PKG_VERSION%>/REVISION'
    },
    cover: {
      compile: {
        files: {
          'build/instrumented/*.js' : ['lib/**/*.js']
        },
        options: {
          basePath: 'lib'
        }
      }
    },
    plato: {
      develop: {
        files: {
          'build/report': ['lib/**/*.js']
        }
      }
    },
    dist: {
      "full": ['build'],
      "no-underscore": ['build:no-underscore'],
      "docs": ['dox']
    }
  };


  var aws = false;
  if (grunt.file.exists('grunt-aws.json')) {
    aws = grunt.file.readJSON('grunt-aws.json');
    if (aws) {
      gruntConfig.aws = aws;
      gruntConfig.s3 = {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          bucket: '<%= aws.bucket %>',
          access: 'public-read',
          // debug: true,
          encodePaths: true,
          maxOperations: 20
        },
        prod: {
          upload: [
            {
              gzip:  true,
              src: 'dist/<%= PKG_VERSION %>/**/*',
              dest: '',
              rel: 'dist/'
            },
            {
              gzip:  false,
              src: 'dist/<%= PKG_VERSION %>/**/*',
              dest: '',
              rel: 'dist/'
            }
          ]
        }
      };
    }
  }
  grunt.initConfig(gruntConfig);

  // default build task
  grunt.registerTask('build_remote', ['clean:remote', 'coffee:remote', 'version', 'requirejs:remote']);
  grunt.registerTask('build_client', ['clean:client', 'coffee:client', 'version', 'requirejs:client']);
  grunt.registerTask('build_libs', ['build_client', 'build_remote']);
  grunt.registerTask('build', ['build_libs', 'hull_widgets']);
  grunt.registerTask('test', ['build', 'cover', 'plato', 'mocha']);
  grunt.registerTask('default', ['connect', 'test', 'watch']);
  grunt.registerTask('deploy', ['dist', 'describe', 's3']);
  grunt.registerTask('reset', ['clean:reset']);

  grunt.registerMultiTask('dist', 'Builds the various flavours of hull.js', function () {
    grunt.task.run(this.data);
  });

  grunt.registerTask("version", "generate a file from a template", function () {
    var conf = grunt.config("version");
    grunt.file.write(conf.dest, grunt.template.process(conf.template));
    grunt.log.writeln('Generated \'' + conf.dest + '\' successfully.');
  });
};
