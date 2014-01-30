module.exports = function (grunt) {
  'use strict';

  var helpers = require('./.grunt/helpers')(grunt);
  var clone = grunt.util._.clone;

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-symlink');
  grunt.loadNpmTasks('grunt-hull-dox');
  grunt.loadNpmTasks('grunt-hull-widgets');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-copy');

  var clientConfig = grunt.file.readJSON('.grunt/client.json');
  var remoteConfig = grunt.file.readJSON('.grunt/remote.json');
  var apiConfig = grunt.file.readJSON('.grunt/api.json');

  var port = 3001;

  // ==========================================================================
  // Project configuration
  // ==========================================================================

  // Lookup of the available libs and injects them for the build
  // in the requirejs conf
  var clientLibs = helpers.getBuiltFilenames('src/client/**/*.coffee');
  var remoteLibs = helpers.getBuiltFilenames('src/remote/**/*.coffee');

  // Lookup of the Aura Extensions and injects them in the requirejs build
  var auraExtensions = grunt.file.glob
    .sync('aura-extensions/**/*.js')
    .map(function (extension) {
      return extension.replace('.js', '');
    });

  var vendorLibs = grunt.file.glob
    .sync('vendor/**/*.js')
    .map(function (extension) {
      return extension.replace('.js', '');
    });

  //Augment the require.js configuation with some computed elements
  var apiRJSConfig = (function () {
    var _c = apiConfig.requireJS;
    _c.optimize = grunt.option('dev') ? "none" : "uglify";
    return _c;
  })();
  var clientRJSConfig = (function () {
    var _c = clientConfig.requireJS;
    _c.include = _c.include.concat(auraExtensions).concat(clientLibs);
    _c.optimize = grunt.option('dev') ? "none" : "uglify";
    return _c;
  })();

  var remoteRJSConfig = (function () {
    var _c = remoteConfig.requireJS;
    _c.include = _c.include.concat(remoteLibs).concat(vendorLibs);
    _c.optimize = grunt.option('dev') ? "none" : "uglify";
    return _c;
  })();


  var gruntConfig = {
    karma: {
      test: {
        configFile: 'karma.conf.js'
      }
    },
    clean: {
      client: {
        src: ['dist/current', 'lib/client/**/*']
      },
      remote: {
        src: ['dist/current', 'lib/remote/**/*']
      },
      reset: {
        src: ['build', 'lib', 'tmp', 'dist', 'bower_components', 'node_modules']
      }
    },
    dox: {
      files: {
        baseDir: 'aura_components',
        src: 'aura_components/**/main.js',
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
        files: grunt.file.expandMapping(remoteConfig.coffeeFiles, 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      },
      client: {
        files: grunt.file.expandMapping(clientConfig.coffeeFiles, 'lib/', {
          rename: function (destBase, destPath) {
            return destBase + destPath.replace(/\.coffee$/, '.js').replace(/^src\//, "");
          }
        })
      },
      api: {
        files: grunt.file.expandMapping(apiConfig.coffeeFiles, 'lib/', {
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
      "client-no-backbone": {
        options: (function (c) {
          c.paths.underscore = 'empty:';
          c.paths.backbone = 'empty:';
          c.out = c.out.replace('hull.js', 'hull.no-backbone.js');
          c.wrap.start = c.wrap.start + ";root._ = window._;";
          c.wrap.start = c.wrap.start + ";root.Backbone = window.Backbone;";
          return c;
        })(clone(clientRJSConfig, true))
      },
      "client-no-underscore": {
        options: (function (c) {
          c.paths.underscore = 'empty:';
          c.out = c.out.replace('hull.js', 'hull.no-underscore.js');
          c.wrap.start = c.wrap.start + ";root._ = window._;";
          return c;
        })(clone(clientRJSConfig, true))
      },
      api: {
        options: clone(apiRJSConfig, true)
      },
      client: {
        options: clone(clientRJSConfig, true)
      },
      remote: {
        options: clone(remoteRJSConfig, true)
      },
      dox: {
        options: {
          namespace: 'Hull',
          paths: { prism: 'aura_components/dox/dox/prism' },
          shim: { prism: { exports: 'Prism' } },
          include: ['prism'],
          out: 'tmp/aura_components/dox/dox/deps.js'
        }
      }
    },
    watch: {
      widgets: {
        files: ['aura_components/**/*'],
        tasks: ['dist:widgets']
      },
      remote: {
        files: remoteConfig.coffeeFiles,
        tasks: ['dist:remote', 'test']
      },
      api: {
        files: apiConfig.coffeeFiles,
        tasks: ['dist:api', 'test']
      },
      client: {
        files: [clientConfig.coffeeFiles, "aura-extensions/**/*.js"],
        tasks: ['dist:client', 'test']
      },
      spec: {
        files: ['spec/**/*.js'],
        tasks: ['test']
      },
      extensions: {
        files: ['aura-extensions/**/*.js'],
        tasks: ['dist:client', 'test']
      }
    },
    version: {
      template: "define(function () { return '<%= PKG_VERSION %>';});",
      dest: 'lib/utils/version.js'
    },
    hull_widgets: {
      hull: {
        src: 'aura_components',
        before: [],
        dest: 'dist/<%= PKG_VERSION%>',
        optimize: !grunt.option('dev')
      }
    },
    describe: {
      out: 'dist/<%= PKG_VERSION%>/REVISION'
    },
    symlink: {
      current: {
        dest: "dist/current",
        src: "dist/<%= PKG_VERSION %>"
      }
    },
    wrap: {
      Handlebars: {
        src: 'node_modules/grunt-contrib-handlebars/node_modules/handlebars/dist/handlebars.js',
        dest: 'lib/shims',
        wrapper: [
          '(function () {', ';define("handlebars", function () {return Handlebars;});})()'
        ]
      }
    },
    dist: {
      "remote": ['version', 'clean:remote', 'coffee:remote', 'wrap', 'version', 'requirejs:remote', 'symlink:current'],
      "client": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client', 'symlink:current'],
      "api": ['version', 'clean:client', 'coffee:api', 'wrap', 'version', 'requirejs:api', 'symlink:current'],
      "client-no-underscore": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client-no-underscore'],
      "client-no-backbone": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client-no-backbone'],
      "widgets": ["version", "hull_widgets"],
      "docs": ['dox'],
      "describe": ['describe']
    },
    copy: {
      artifacts: {
        expand: true,
        cwd: 'dist/<%= PKG_VERSION %>',
        src: ['**'],
        dest: '<%= ARTIFACTS_PATH %>/'
      }
    }
  };

  helpers.appendAWSConfig(gruntConfig);
  grunt.initConfig(gruntConfig);

  grunt.registerTask('test', ['version', 'karma:test']);
  grunt.registerTask('reset', ['clean:reset']);

  //These tasks are the only ones needed to be used
  grunt.registerTask('default', 'server');
  grunt.registerTask('server', ['connect', 'dist:remote', 'dist:client', 'dist:api', 'dist:widgets', 'watch']);
  grunt.registerTask('deploy', ['dist', 's3:prod']);

  var buildSteps = ['version', 'karma:test', 'dist'];
  if (process.env.CIRCLE_ARTIFACTS) {
    buildSteps.push('copy:artifacts');
  }

  grunt.registerTask('build', buildSteps);

  require('./.grunt/customTasks')(grunt);

};
