var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var config = require('./config');
var StatsPlugin = require('stats-webpack-plugin');
var assign = require('object-assign');

var devOutput = _.extend({},config.output,{publicPath: config.previewUrl+config.assetsFolder+'/'});

if(config.hotReload){
  var devEntry = _.reduce(config.entry,function(entries,v,k){
    entries[k] = ['webpack-dev-server/client?'+config.previewUrl, 'webpack/hot/dev-server', v];
    return entries;
  },{});
  var devPlugins = [new webpack.HotModuleReplacementPlugin(), new webpack.NoErrorsPlugin()]
} else {
  var devEntry = config.entry
  var devPlugins = [new webpack.NoErrorsPlugin()]
}

debugOutput = assign({},config.output,{filename: '[name].debug.js',});

var uglifyPlugin =  new webpack.optimize.UglifyJsPlugin({
  comments: false,
  minimize:true,
  ascii_only:true,
  quote_keys:true,
  sourceMap: false,
  beautify: false,
  compress: {
    warnings: false,
    drop_console: false,
    drop_debugger:false,
    dead_code:true,
    // comparisons: true,
    // conditionals:true
    join_vars:true
  }
})

module.exports = {
  development:{
   browser: {
      name     : 'browser',
      devtool  : '#source-map',
      devServer: true,
      entry    : devEntry,
      output   : devOutput,
      resolve  : {
        root: [path.join(__dirname, "bower_components")],
        extensions: config.extensions
      },
      module   : {loaders: config.loaders},
      plugins:  config.plugins.concat([
        new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('development') } })
      ]).concat(devPlugins)
    }
  },
  production:{
    browser: {
      name    : 'browser',
      devtool  : '#source-map',
      entry   : config.entry,
      output  : config.output,
      resolve : {
        root: [path.join(__dirname, "bower_components")],
        extensions: config.extensions
      },
      module  : {loaders: config.loaders},
      plugins : config.plugins.concat([
        new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production') } }),
        uglifyPlugin,
        new webpack.optimize.DedupePlugin(),
        new StatsPlugin(path.join(__dirname, config.outputFolder, 'stats.json'), { chunkModules: true, profile: true })
      ])
    }
  },
  debug:{
    browser: {
      name    : 'browser',
      devtool  : '#source-map',
      entry   : config.entry,
      output  : debugOutput,
      resolve : {
        root: [path.join(__dirname, "bower_components")],
        extensions: config.extensions
      },
      module  : {loaders: config.loaders},
      plugins : config.plugins.concat([
        new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production') } }),
        new webpack.optimize.DedupePlugin()
      ])
    }
  },
}
