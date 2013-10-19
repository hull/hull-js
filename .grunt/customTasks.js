var git = require('git-rev');

module.exports = function (grunt) {
  grunt.registerMultiTask('dist', 'Builds the various flavours of hull.js', function () {
    grunt.task.run(this.data);
  });

  grunt.registerTask("version", "generate a file from a template", function () {
    var conf = grunt.config("version");
    var done = this.async();
    function write (name) {
      grunt.config.set("PKG_VERSION", name);
      grunt.file.write(conf.dest, grunt.template.process(conf.template));
      grunt.log.writeln('Generated version description for \'' + conf.dest + '\' successfully: ' + name);
      done();
    }
    git.branch(function(branch) {
      if (['HEAD', 'master'].indexOf(branch) !== -1) {
        git.tag(write);
      } else {
        write(branch);
      }
    });

  });
};
