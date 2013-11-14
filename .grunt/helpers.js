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
      } else {
        var aws_key     =  process.env.AWS_KEY;
        var aws_secret  =  process.env.AWS_SECRET;
        var aws_bucket  =  process.env.AWS_BUCKET;
        if (aws_key && aws_secret && aws_bucket) {
          aws = {
            key: aws_key,
            secret: aws_secret,
            bucket: aws_bucket
          };
        }
      }
      if (aws) {
        config.aws = aws;
        config.s3 = {
          options: {
            key: '<%= aws.key %>',
            secret: '<%= aws.secret %>',
            bucket: '<%= aws.bucket %>',
            access: 'public-read',
            //debug: true,
            encodePaths: true,
            maxOperations: 20,
            headers: {
              'Cache-Control': 'max-age=<%= cache %>, public',
              'Expires': '<%= expires %>'
            }
          },
          prod:{
            upload:[
              {
                gzip:  false,
                src: 'dist/<%= PKG_VERSION %>/**/*',
                dest: '<%= PKG_VERSION %>',
                rel: 'dist/<%= PKG_VERSION %>'
              },
              {
                gzip:  true,
                src: 'dist/<%= PKG_VERSION %>/**/*.js',
                dest: '<%= PKG_VERSION %>',
                rel: 'dist/<%= PKG_VERSION %>'
              }
            ]
          }
        };
      }
    }
  };
};
