"use strict";
/*global require, module*/

import _ from "../../utils/lodash";
import Deployment from "./deployment";

let _initialized = false;
let _context = {};

function embedDeployments(deployments, opts={}, callback) {
  if (!deployments || !deployments.length){return;}
  if (opts.reset !== false) { Deployment.resetDeployments()}
  var dpll = deployments.length;
  var embeds = [];

  var allEmbedCompleteCallback = function() {
    embeds.push(this);
    if (embeds.length === dpll && _.isFunction(callback)) {
      callback(embeds);
    }
  };

  var dpl;

  for (var d = 0, l = deployments.length; d < l; d++) {
    dpl = new Deployment(deployments[d], _context);
    dpl.embed({ refresh: true }, allEmbedCompleteCallback);
  }
}

module.exports = {
  initialize: function(context) {
    _initialized = true;
    _context = context;
  },
  embed: function(deployments, opts, callback) {
    embedDeployments(deployments, opts, callback);
  },
  onEmbed: function(doc, fn) {
    var deploymentId = null;
    if(fn===undefined){
      // loaded file.js
      fn = doc
      deploymentId = currentScript.getAttribute('data-hull-deployment');
    } else {
      // loaded file.html
      deploymentId = doc.deploymentId;
    }
    var deployment = Deployment.getDeployment(deploymentId);
    if(deployment){
      deployment.onEmbed(fn);
    }
  }
};
