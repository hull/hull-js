'use strict';
/*global require, module*/

import _          from '../../utils/lodash';
import throwErr   from '../../utils/throw';
import logger     from '../../utils/logger';
import Promise    from '../../utils/promises';
import getCurrentScript from '../../utils/get-current-script';
import Deployment from './deployment';

let _initialized = false;
let _context = {};

module.exports = {
  initialize: function(context) {
    _initialized = true;
    _context = context;
  },

  embed: function(deployments, opts, callback, errback) {
    if (!deployments || !deployments.length){return;}
    if (opts.reset !== false) { Deployment.resetDeployments()}

    let embeds = [];
    let promises = [];

    logger.log('Embedding Deployments', deployments)
    for (let d = 0, l = deployments.length; d < l; d++) {
      let dpl = new Deployment(deployments[d], _context);
      promises.push(dpl.embed({ refresh: true }));
    }

    Promise.all(promises).then((deployments)=>{
      logger.log('Deployments resolved', deployments)
      if (_.isFunction(callback)){
        callback(_.map(deployments, 'value'))
      }
    },errback).catch(throwErr);
  },

  onEmbed: function() {
    let args = Array.prototype.slice.call(arguments);
    let callback;

    while (args.length>0 && !_.isFunction(callback)){
      callback = args.shift();
    }

    if (!_.isFunction(callback)) return false;

    let currentScript  = document.currentScript  || getCurrentScript();
    logger.verbose('currentScript', currentScript);

    // detectedScript is null on Chrome. Use this to use either the polyfill or the native implementation.
    // Fallback to script detection (how will this work ?)

    // Detect JS embed mode first.
    let shipId = currentScript.getAttribute('data-hull-ship-script');
    let deployments = Deployment.getDeployments(shipId);
    // In JS-mode, callbacks are passed down to the DeploymentStrategy,
    // In theother modes, they are ignored because we retreive the callbacks from the import document.
    if(deployments && deployments.length){
      for (var i = deployments.length - 1; i >= 0; i--) {
        if(deployments[i]){
          deployments[i].onEmbed(callback)
        }
      };
    }
  }
};
