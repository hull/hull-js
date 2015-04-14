"use strict";
/*global require, module*/

import _ from "../../utils/lodash";
import Deployment from "./deployment";


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
    dpl = new Deployment(deployments[d]);
    dpl.embed({refresh:true}, allEmbedCompleteCallback);
  }
}

module.exports = {
  embed: function(deployments, opts, callback) {
    embedDeployments(deployments, opts, callback);
  },
  onEmbed: function(doc, fn) {
    var cs = doc && doc._currentScript || doc.currentScript;
    if(doc===window.document){
      if(cs.getAttribute('data-hull-deployment')){
        var dpl = Deployment.getDeployment(cs.getAttribute('data-hull-deployment'));
        if(dpl){
          _.map(dpl.getTargets(),function(target){
            dpl.performCallback(target, fn)
          })
        }
      }
    } else {
      if (cs && cs.ownerDocument) {
        cs.ownerDocument.onEmbed = fn;
      }
    }
  }
};
