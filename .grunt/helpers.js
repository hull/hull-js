"use strict";

module.exports = function (grunt) {
  return {
    getBuiltFilenames: function (pattern) {
      return grunt.file.glob
        .sync(pattern)
        .map(function (lib) {
          return lib.replace('.coffee', '').replace('src/', 'lib/');
        });
    },
    appendAWSConfig: function (config) {
      var aws = false;
      if (grunt.file.exists('.grunt/grunt-aws.json')) {
        aws = grunt.file.readJSON('.grunt/grunt-aws.json');
        if (aws) {
          config.aws = aws;
          config.s3 = {
            options: {
              key: '<%= aws.key %>',
              secret: '<%= aws.secret %>',
              bucket: '<%= aws.bucket %>',
              access: 'public-read',
              // debug: true,
              encodePaths: true,
              maxOperations: 20
            },
            prod:{
              upload:[
                {
                  gzip:  true,
                  src: 'dist/<%= PKG_VERSION %>/**/*',
                  dest: '<%= PKG_VERSION %>',
                  rel: 'dist/<%= PKG_VERSION %>'
                },
                {
                  gzip:  false,
                  src: 'dist/<%= PKG_VERSION %>/**/*',
                  dest: '<%= PKG_VERSION %>',
                  rel: 'dist/<%= PKG_VERSION %>'
                }
              ]
            }
          };
        }
      }
    }
  };
};
