/* global $:true, define:true, sinon:true */
define(function () {
  "use strict";

  function createApp (done) {
    module.initDeferred = $.Deferred();
    var stub = sinon.stub({
      use: function () { },
      start: function () { },
      stop: function () { }
    });
    module.app = stub;
    stub.use.returns(stub);
    stub.start.returns(module.initDeferred);
    var auraModule = sinon.spy(function () {
      return stub;
    });


    require.undef('aura/aura');
    require.undef('lib/hull');
    define('aura/aura', function () {
      return auraModule;
    });
    define('lib/hullbase', function () {
      return {};
    });
    require(['lib/hull', 'aura/aura', 'lib/hullbase'], function (hull) {
      module.hullInit = hull;
      done();
    });
  }

  var module = {
    createApp: createApp,
    hullInit: function () {
      throw 'hullInit has not been defined yet';
    },
    app: function () {
      throw 'Hull app has not been defined yet';
    },
    initDeferred: null,
    resetApp: function () {
      module.initDeferred = $.Deferred();
      delete module.hullInit({}).app;
    }
  };
  return module;

});
