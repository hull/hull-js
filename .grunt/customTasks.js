var git = require('git-rev');

module.exports = function (grunt) {
  grunt.registerMultiTask('dist', 'Builds the various flavours of hull.js', function () {
    grunt.task.run(this.data);
  });

  grunt.registerTask("version", "generate a file from a template", function () {
    var conf = grunt.config("version");
    grunt.file.write(conf.dest, grunt.template.process(conf.template));
    grunt.log.writeln('Generated \'' + conf.dest + '\' successfully.');
  });

  grunt.registerTask('target','Set current target', function(){
    var done = this.async();
    git.branch(function(branch){
      grunt.config.set("PKG_VERSION",branch);
      grunt.config.set("GIT_BRANCH",branch);
      done();
    });
  });
};
