"use strict";

import _      from "../utils/lodash";
import assign from "../polyfills/assign";

var wrappedRequest = function(service, gateway, middlewares=[]){
  return function query(request, callback, errback){
    if(!callback){callback = function(){};}
    if(!errback){errback = function(){};}

    var path = request.path;

    if (path[0] === "/"){
      path = path.substring(1);
    }
    path = (service.name!=="hull")? "services/#{service.path}/#{path}":path;

    if (service.name !== "hull"){
      request.params = (request.method.toLowerCase()==="delete")?JSON.stringify(request.params||{}):request.params;
    }

    var req = assign({}, request, {path});
    var handle = gateway.handle(req);
    _.each(middlewares, function(m){
      handle = handle.then(m, m);
    });

    handle = handle.then((response)=>{
      response = assign({}, response, { provider: service.name });

      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        throw response.body || response;
      }
    })

    handle.then(callback, errback);

    return handle;
  };
};

export default wrappedRequest;
