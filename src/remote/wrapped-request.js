"use strict";

import _ from "../utils/lodash";
import assign from "object-assign";

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

    if (middlewares.length > 0){
      _.each(middlewares, function(m){
        handle.then(m, m);
      });
    }

    handle.then((response)=>{
      response.provider = service.name;
      callback(response);
    }, errback);

    return handle;
  };
};

export default wrappedRequest;
