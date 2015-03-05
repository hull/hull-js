"use strict";
/*global require*/
var _                = require("lodash");
var del              = require("del");
var _open            = require("open");
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

var webpack          = require("webpack");
var WebpackDevServer = require("webpack-dev-server");


// Get our Config.
var config = require("./config");
var webpackConfig = require("./webpack.config");

harmonize();

gulp.task("default", ["server"]);
gulp.task("serve",   ["server"]);
gulp.task("clean",   function(callback) {del(["./"+config.outputFolder+"/**/*"], callback); });

gulp.task("server",  function(callback) {runSequence("clean", "copy-files:watch", "webpack:server", callback); });
gulp.task("build",   function(callback) {runSequence("clean", "copy-files", "webpack:build", callback); });
gulp.task("deploy",  function(callback) {runSequence("build", "publish", callback); });


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
gulp.task("webpack:build", function(callback) {
  // Then, use Webpack to bundle all JS and html files to the destination folder
  notify("Building App");
  webpack(_.values(webpackConfig.production), function(err, stats) {
    if (err) {throw new gutil.PluginError("webpack:build", err); }

    var jsonStats = stats.toJson();

    if (jsonStats.errors.length > 0) {
      return new gutil.PluginError("webpack:build", JSON.stringify(jsonStats.errors));
    }

    if (jsonStats.warnings.length > 0) {
      new gutil.PluginError("webpack:build", JSON.stringify(jsonStats.warnings));
    }


    gutil.log("[webpack:build]", stats.toString({colors: true}));
    notify("App Built");

    callback();
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
    hot: true,
    stats: {colors: true }
  }).listen(config.serverPort, function(err) {
    handleError(err, taskName);
    // Dump the preview URL in the console, and open Chrome when launched for convenience.
    var url = webpackConfig.development.browser.output.publicPath+"webpack-dev-server/";
    gutil.log("["+taskName+"]", url);
    notify({message: "Dev Server Started"});
    _open(url, "chrome");
  });
});

// Deploys to S3
gulp.task('publish',function(){
  if(!!config.aws){
    var publisher = awspublish.create(config.aws.config);
    var publishedFiles  = path.join(config.outputFolder, config.assetsFolder, "*")
    return gulp.src(publishedFiles)
    .pipe(rename(function(p){ p.dirname += config.aws.prefix;}))
    .pipe(parallelize(publisher.publish(config.aws.publish.headers,config.aws.publish.options)))
    .pipe(awspublish.gzip(config.aws.gzip))
    .pipe(parallelize(publisher.publish(config.aws.publish.headers,config.aws.publish.options)))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
  }
});

// gulp.task('release', function(){
  // TODO
  // version = 0.9.1
  // run tests
  // update package.json to version
  // create tag on github
  // publish to aws with:
    // var aws = config.getAWSConfig(version);
    // ....
// })

// gulp.task("jest", function(callback) {
//     jest.runCLI({ config: jestConfig }, ".", function() {
//         callback();
//     });
// });

// gulp.task("jest:watch", function(){
//   gulp.watch(["__tests__/**", config.sourceFolder+"/**"], ["jest"]);
// });
