module.exports = function (grunt) {
  "use strict";
  var _awsConfig = false;
  if (grunt.file.exists('.grunt/grunt-aws.json')) {
    _awsConfig = grunt.file.readJSON('.grunt/grunt-aws.json');
  } else {
    var aws_key           =  process.env.AWS_KEY || '';
    var aws_secret        =  process.env.AWS_SECRET || '';
    var aws_bucket        =  process.env.AWS_BUCKET || '';
    var aws_distribution  =  process.env.AWS_DISTRIBUTION || '';
    _awsConfig = {
      key: aws_key,
      secret: aws_secret,
      bucket: aws_bucket,
      distribution: aws_distribution
    };
  }
  return {
    getBuiltFilenames: function (pattern) {
      return grunt.file.glob
        .sync(pattern)
        .map(function (lib) {
          return lib.replace('.coffee', '').replace('src/', 'lib/');
        });
    },
    appendAWSConfig: function (config) {
      config.aws = _awsConfig;
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
    },
    cloudFrontConfig: function (config) {
      config.aws = _awsConfig;
      config.invalidate_cloudfront = {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          distribution: '<%= aws.distribution %>'
        },
        production: {
          files: [{
            dest: grunt.option('file')
          }]
        }
      };
    },
    updateDistTask: function (config, isDev) {
      config = config.dist;
      if (!isDev || !config) return;

      var subKeys = ['remote', 'api', 'client'];
      subKeys.forEach(function (key) {
        var subTask = config[key];
        var lookedUpName = 'uglify:' + key;
        var lookedUpIdx = subTask.indexOf(lookedUpName);
        if (lookedUpIdx === -1) return;
        subTask.splice(lookedUpIdx, 1, 'copy:' + key);
      });
    }
  };
};
