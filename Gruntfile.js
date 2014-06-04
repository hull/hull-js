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
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-hull-dox');
  grunt.loadNpmTasks('grunt-hull-components');
  grunt.loadNpmTasks('grunt-s3');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
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
    _c.optimize = 'none';
    return _c;
  })();
  var clientRJSConfig = (function () {
    var _c = clientConfig.requireJS;
    _c.include = _c.include.concat(auraExtensions).concat(clientLibs);
    _c.optimize = 'none';
    return _c;
  })();

  var remoteRJSConfig = (function () {
    var _c = remoteConfig.requireJS;
    _c.include = _c.include.concat(remoteLibs).concat(vendorLibs);
    _c.optimize = 'none';
    return _c;
  })();


  var gruntConfig = {
    karma: {
      test: {
        configFile: 'karma.conf.js'
      }
    },
    copy: {
      api: {
        files: [{
          expand: false,
          src: ['dist/<%= PKG_VERSION%>/hull.api.debug.js'],
          dest: 'dist/<%= PKG_VERSION%>/hull.api.js'
        }]
      },
      client: {
        files: [{
          expand: false,
          src: ['dist/<%= PKG_VERSION%>/hull.debug.js'],
          dest: 'dist/<%= PKG_VERSION%>/hull.js'
        }]
      },
      remote: {
        files: [{
          expand: false,
          src: ['dist/<%= PKG_VERSION%>/hull-remote.debug.js'],
          dest: 'dist/<%= PKG_VERSION%>/hull-remote.js'
        }]
      }
    },
    uglify: {
      options: {},
      api: {
        files: {
          'dist/<%= PKG_VERSION%>/hull.api.js' : ['dist/<%= PKG_VERSION%>/hull.api.debug.js']
        }
      },
      client: {
        files: {
          'dist/<%= PKG_VERSION%>/hull.js' : ['dist/<%= PKG_VERSION%>/hull.debug.js']
        }
      },
      remote: {
        files: {
          'dist/<%= PKG_VERSION%>/hull-remote.js' : ['dist/<%= PKG_VERSION%>/hull-remote.debug.js']
        }
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
    cssmin: {
      minify: {
        expand: true,
        src: 'aura_components/**/*.css',
        dest: 'dist/<%= PKG_VERSION %>/',
        ext: '.min.css'
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
          c.out = c.out.replace('hull.debug.js', 'hull.no-backbone.js');
          c.wrap.start = c.wrap.start + ";root._ = window._;";
          c.wrap.start = c.wrap.start + ";root.Backbone = window.Backbone;";
          c.optimize = "uglify";
          return c;
        })(clone(clientRJSConfig, true))
      },
      "client-no-underscore": {
        options: (function (c) {
          c.paths.underscore = 'empty:';
          c.out = c.out.replace('hull.debug.js', 'hull.no-underscore.js');
          c.wrap.start = c.wrap.start + ";root._ = window._;";
          c.optimize = "uglify";
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
      components: {
        files: ['aura_components/**/*'],
        tasks: ['dist:components', 'cssmin']
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
    hull_components: {
      options: {
        optimize: !grunt.option('dev')
      },
      hull: {
      sourceName: "hull",
        src: 'aura_components',
        dest: 'dist/<%= PKG_VERSION%>/aura_components'
      },
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
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commit: true,
        commitMessage: 'Release %VERSION%',
        commitFiles: ['-a'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Release %VERSION%',
        push: false
      }
    },
    dist: {
      "remote": ['version', 'clean:remote', 'coffee:remote', 'wrap', 'version', 'requirejs:remote', 'uglify:remote', 'symlink:current'],
      "client": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client', 'uglify:client', 'cssmin', 'symlink:current'],
      "api": ['version', 'clean:client', 'coffee:api', 'wrap', 'version', 'requirejs:api', 'uglify:api', 'symlink:current'],
      "client-no-underscore": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client-no-underscore'],
      "client-no-backbone": ['version', 'clean:client', 'coffee:client', 'wrap', 'version', 'requirejs:client-no-backbone'],
      "components": ["version", "hull_components:hull"],
      "docs": ['dox'],
      "describe": ['describe']
    }
  };

  helpers.updateDistTask(gruntConfig, !!grunt.option('dev'));

  helpers.appendAWSConfig(gruntConfig);
  helpers.cloudFrontConfig(gruntConfig);
  grunt.initConfig(gruntConfig);

  grunt.registerTask('test', ['version', 'karma:test']);

  grunt.registerTask('reset', ['clean:reset']);

  //These tasks are the only ones needed to be used
  grunt.registerTask('default', 'server');
  grunt.registerTask('server', ['connect', 'dist:remote', 'dist:client', 'test', 'dist:api', 'dist:components', 'watch']);
  grunt.registerTask('deploy', ['dist', 's3:prod']);

  require('./.grunt/customTasks')(grunt);

};
