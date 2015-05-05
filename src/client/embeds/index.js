"use strict";
/*global require, module*/

import _          from "../../utils/lodash";
import Deployment from "./deployment";

let _initialized = false;
let _context = {};

function embedDeployments(deployments, opts={}, callback) {
  if (!deployments || !deployments.length){return;}
  if (opts.reset !== false) { Deployment.resetDeployments()}

  var embeds = [];
  var deploymentPromises = [];

  for (var d = 0, l = deployments.length; d < l; d++) {
    var dpl = new Deployment(deployments[d], _context);
    deploymentPromises.push(dpl.embed({ refresh: true }));
  }

  Promise.all(deploymentPromises).then((deployments)=>{
    if (_.isFunction(callback)){
      callback(_.pluck(deployments, 'value'))
    }
  })
}

module.exports = {
  initialize: function(context) {
    _initialized = true;
    _context = context;
  },
  embed: function(deployments, opts, callback) {
    embedDeployments(deployments, opts, callback);
  },
  onEmbed: function() {
    var deploymentId = null;
    var cs = document._currentScript || document.currentScript;
    var doc = cs.ownerDocument;
    if (doc!==document){
      // we're inside an Import
      deploymentId = doc.deploymentId;
    } else {
      // We're executing a Raw script.
      deploymentId = cs.getAttribute("data-hull-deployment");
    }

    var deployment = Deployment.getDeployment(deploymentId);
    if(deployment){ deployment.onEmbed.apply(this, arguments); }
  }
};
