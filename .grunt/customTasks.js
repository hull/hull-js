var git = require('git-rev');

module.exports = function (grunt) {
  var SEMVER_REGEXP = /^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/;

  grunt.registerMultiTask('dist', 'Builds the various flavours of hull.js', function () {
    grunt.task.run(this.data);
  });

  grunt.registerTask("version", "generate a file from a template", function () {
    var conf = grunt.config("version");
    var done = this.async();
    function write (name) {
      grunt.config.set("PKG_VERSION", name);
      grunt.file.write(conf.dest, grunt.template.process(conf.template));

      var t = (SEMVER_REGEXP.test(name)) ? 31536000 : 0;
      grunt.config.set('cache', t);
      grunt.config.set('expires', new Date(Date.now() + t * 1000).toUTCString());

      grunt.log.writeln(('Generated version description "' + name + '" for \'' + conf.dest + '\' successfully.').green);

      done();
    }

    if (process.env.CIRCLE_ARTIFACTS) {
      grunt.config.set("ARTIFACTS_PATH", process.env.CIRCLE_ARTIFACTS);
      git.short(write);
    } else {
      grunt.config.set("ARTIFACTS_PATH", "build");
      git.branch(function(branch) {
        if (['HEAD', 'master'].indexOf(branch) !== -1) {
          git.tag(write);
        } else {
          write(branch);
        }
      });
    }
  });
};
