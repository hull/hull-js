"use strict";
/*global require*/
var _                = require("lodash");
var del              = require("del");
var path             = require("path");
var runSequence      = require("run-sequence");

var gulp             = require("gulp");
var harmonize        = require("harmonize");
var awspublish       = require("gulp-awspublish");
var rename           = require("gulp-rename");
var parallelize      = require("concurrent-transform");
var gutil            = require("gulp-util");
var deploy           = require("gulp-gh-pages");
var notifier         = require("node-notifier");
var merge            = require('merge-stream');

var ngrok            = require('ngrok');
var webpack          = require("webpack");
var WebpackDevServer = require("webpack-dev-server");


// Get our Config.
var config           = require("./config");
var webpackConfig    = require("./webpack.config");

harmonize();

var notify = function(message){
  notifier.notify({title: config.displayName+" Gulp",message:message});
};


// Setup a Ngrok server
var ngrokServe = function(subdomain){
  var options = { port: config.serverPort };
  var env = process.env;
  if (env.NGROK_AUTHTOKEN) {
    options.authtoken = env.NGROK_AUTHTOKEN;
  }
  if(env.NGROK_SUBDOMAIN || subdomain){
    options.subdomain = (env.NGROK_SUBDOMAIN || subdomain).replace(/-/g,'');
  }
  ngrok.connect(options, function (error, url) {
    if (error) {
      throw new gutil.PluginError('ship:server', error);
    }

    url = url.replace('https', 'http');
    notify({message:"Ngrok Started on "+url});

    gutil.log('[ship:server]', url);
  });
}


gulp.task("default", ["server"]);
gulp.task("serve",   ["server"]);
gulp.task("clean",   function(callback) {del(["./"+config.outputFolder+"/**/*"], callback); });

gulp.task("server",  function(callback) {runSequence("clean", "copy-files:watch", "webpack:server", callback); });
gulp.task("build",   function(callback) {runSequence("clean", "copy-files", "webpack:build", callback); });
gulp.task("deploy",  function(callback) {runSequence("build", "publish:sha", callback); });
gulp.task("deploy:release",  function(callback) {runSequence("build", "publish:release", callback); });


var notify = function(message){
  notifier.notify({title: config.displayName+" Gulp", message: message});
};
var handleError = function(err, taskName){
  if(err){
    notify(taskName+" Error: "+ err);
    throw new gutil.PluginError("webpack:build", err);
  }
};
// Copy static files from the source to the destination
var copyFiles = function(callback){
  _.map(config.files, function(dest, src){
    gulp.src(src).pipe(gulp.dest(dest));
  });
  notify("Vendors Updated");
  if (_.isFunction(callback)){
    callback();
  }
};

gulp.task("copy-files", copyFiles);

gulp.task("copy-files:watch", function(){
  copyFiles();
  gulp.watch(_.keys(config.files), copyFiles);
});

//Production Build.
//Minified, clean code. No demo keys inside.
//demo.html WILL NOT WORK with this build.
//
//Webpack handles CSS/SCSS, JS, and HTML files.
var afterBuild = function(err, stats){
  if (!!err) {throw new gutil.PluginError("webpack:build", err); }

  var jsonStats = stats.toJson();

  if (jsonStats.errors.length > 0) {
    return new gutil.PluginError("webpack:build", JSON.stringify(jsonStats.errors));
  }

  if (jsonStats.warnings.length > 0) {
    new gutil.PluginError("webpack:build", JSON.stringify(jsonStats.warnings));
  }


  gutil.log("[webpack:build]", stats.toString({colors: true}));
  notify("App Built");
};
gulp.task("webpack:build", function(callback) {
  // Then, use Webpack to bundle all JS and html files to the destination folder
  notify("Building App");
  webpack(_.values(webpackConfig.production), function(err, stats) {
    afterBuild(err, stats);
    webpack(_.values(webpackConfig.debug), function(err, stats){
      afterBuild(err, stats);
      callback();
    });
  });
});

// Dev Build
// Create the webpack compiler here for caching and performance.
var devCompiler = webpack(webpackConfig.development.browser);

// Build a Dev version of the project. Launched once on startup so we can have eveything copied.
gulp.task("webpack:build:dev", function(callback) {
  // run webpack with Dev profile.
  // Embeds the Hull config keys, and the necessary stuff to make demo.html work
  devCompiler.run(function(err, stats) {
    if (err){
      throw new gutil.PluginError("webpack:build:dev", err);
    }

    var jsonStats = stats.toJson();

    if(jsonStats.errors.length > 0){
      return new gutil.PluginError("webpack:build:dev", JSON.stringify(jsonStats.errors));
    }

    if(jsonStats.warnings.length > 0){
      new gutil.PluginError("webpack:build:dev", JSON.stringify(jsonStats.warnings));
    }

    gutil.log("[webpack:build:dev]", stats.toString({colors: true}));
    notify({message: "Webpack Updated"});
    callback();
  });
});

// Launch webpack dev server.
gulp.task("webpack:server", function() {
  var taskName = "webpack:server";
  new WebpackDevServer(devCompiler, {
    contentBase: config.outputFolder,
    publicPath: config.assetsFolder+"/",
    hot: config.hotReload,
    stats: {colors: true }
  }).listen(config.serverPort, function(err) {
    handleError(err, taskName);
    // Dump the preview URL in the console, and open Chrome when launched for convenience.
    notify({message: "Dev Server Started"});
    var url = webpackConfig.development.browser.output.publicPath+"webpack-dev-server/";
    ngrokServe(config.libName)
    gutil.log("["+taskName+"]", url);
  });
});

var publish = function(versions){
  var aws = config.aws
  var publisher = awspublish.create(aws.config);
  var files  = path.join(config.outputFolder, config.assetsFolder, "*")
  var streams = [];
  for (var i = 0; i < versions.length; i++) {
    var version = versions[i];
    if(version){
      console.log('Deploying to ',version);
      var plain = gulp.src(files)
      .pipe(rename(function(p){
        p.dirname += '/'+version;
        console.log('Publishing '+path.join(p.dirname,p.basename+p.extname))
      }))
      var gzip = gulp.src(files)
      .pipe(rename(function(p){
        p.dirname += '/'+version;
        console.log('Publishing '+path.join(p.dirname,p.basename+p.extname))
      }))
      .pipe(awspublish.gzip(aws.gzip))

      streams.push(plain);
      streams.push(gzip);
    }
  };
  return merge.apply(merge,streams)
  .pipe(parallelize(publisher.publish(aws.publish.headers,aws.publish.options)))
  .pipe(publisher.cache())
  .pipe(awspublish.reporter())
;
}

// Deploys to S3
gulp.task('publish:sha',function(){
  var SHA1 = process.env.CIRCLE_SHA1;
  if( !SHA1 ){ return; }
  return publish([SHA1]);
});

gulp.task('publish:release',function(){
  var SHA1 = process.env.CIRCLE_SHA1;
  var RELEASE = config.pkg.version;
  if( !SHA1 || !RELEASE ){ return; }
  return publish([SHA1,RELEASE]);
});
