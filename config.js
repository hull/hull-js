'use strict';

var fs = require('fs');
var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');
var moment = require('moment');
var git = require('git-rev-sync');

// DO NOT CHANGE FOLDERS
// WIHTOUT UPDATING PACKAGE.JSON TOO.
var sourceFolder = 'src';
var outputFolder = 'lib';
var assetsFolder = '';
var serverPort   = process.env.PORT||3001;
var previewUrl   = 'http://localhost:'+serverPort;

var hotReload = false;

// DO NOT CHANGE SHIP ENTRY
// WITHOUT UPDATING PACKAGE.JSON TOO
// THESE ARE THE JS FILES USED AS ENTRY POINTS TO COMPILE YOUR APP
var entry = {
  hull:        './'+sourceFolder+'/hull.coffee'
}

// ADDITIONAL FILES TO BE COPIED BY GULP
function gulpDest(out){
  return path.join(outputFolder,assetsFolder,out);
}

var files = {
  'app/**/*'         : outputFolder,
  'src/vendors/**/*' : gulpDest('vendors/'),
  'src/images/**/*'  : gulpDest('images/'),
  'src/*.html'       : outputFolder
}

var libName = pkg.name;
var displayName = 'Hull.js';

var getAWSConfig = function(){
  return {
    gzip: { ext:".gz" },
    config : {
      "params":{
        "Bucket": process.env.AWS_BUCKET,
      },
      "region": process.env.AWS_REGION,
      "accessKeyId":process.env.AWS_KEY,
      "secretAccessKey":process.env.AWS_SECRET,
    },
    cloudfront:{
      credentials:{
        "accessKeyId":process.env.AWS_KEY,
        "secretAccessKey":process.env.AWS_SECRET,
      },
      distributionId:process.env.CLOUDFRONT_DISTRIBUTION_ID,
      region:"us-east-1"
    },
    publish:{
      options:{
        simulate: false,
      },
      headers: {
        "Cache-Control": "max-age=3600, no-transform, public"
      }
    }
  };
};

// ------------------------------------------------
// ------------------------------------------------
// NO NEED TO TOUCH ANYTHING BELOW THIS
// ------------------------------------------------
// ------------------------------------------------

var outputPath = path.join(__dirname, outputFolder);

var output = {
  path: path.join(outputPath,assetsFolder),
  pathinfo: true,
  filename: '[name].js',
  chunkFileName: '[name].chunk.js',
  libraryTarget: 'umd',
  library: displayName,
  publicPath: '/'+assetsFolder+'/'
}

var extensions         = ['', '.js', '.css', '.scss', '.coffee'];
var modulesDirectories = ['node_modules', 'bower_components', 'src/vendor'];

var sassIncludePaths   = modulesDirectories.map(function(include){
  return ('includePaths[]='+path.resolve(__dirname, include))
}).join('&');


// https://github.com/webpack/react-starter/blob/master/make-webpack-config.js
// 'imports?define=>false': Yeah, we're going big and disabling AMD completely. F**k it.
// This is because webpack strips the `this` context when requiring those, while they expect it.
// Basically, this fixes all of our problems with badly constructed AMD modules.
// Among which: vex, datepicker
var loaders = [
  {test: /\.json$/,                loader: 'json'  },
  {test: /\.coffee$/,              loader: 'coffee'},
  {test: /\.js$/,                  loader: 'babel', exclude: /node_modules|bower_components/},
  {test: /\.jpe?g$|\.gif$|\.png$/, loader: 'file'  },
  {test: /\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/, loader: 'file' },
];

var REVISION = process.env.CIRCLE_SHA1 || git.short();

// We remove the 'dist' from the filenames for demo and index.html in package.json
// Package.json expects our files to be addressable from the same repo
// We put them in `dist` to have a clean structure but then we need to build them in the right place
var plugins = [
  new webpack.DefinePlugin({
    'VERSION'  : JSON.stringify(pkg.version),
    'REVISION' : JSON.stringify(REVISION),
    'BUILD_DATE' : JSON.stringify(moment().format('MMMM, DD, YYYY, HH:mm:ss')),
    'PUBLIC_PATH': JSON.stringify(output.publicPath)
  }),
  new webpack.ResolverPlugin(
    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
  ),
  new webpack.optimize.OccurenceOrderPlugin()
]

var externals = {}

module.exports = {
  hotReload          : hotReload,
  aws                : getAWSConfig(),
  libName            : libName,
  displayName        : displayName,
  version            : pkg.version,

  files              : files,

  outputFolder       : outputFolder,
  assetsFolder       : assetsFolder,
  serverPort         : serverPort,
  previewUrl         : previewUrl,

  entry              : entry,
  output             : output,
  extensions         : extensions,
  modulesDirectories : modulesDirectories,
  plugins            : plugins,
  loaders            : loaders,
  externals          : externals,

  pkg                : pkg
}
