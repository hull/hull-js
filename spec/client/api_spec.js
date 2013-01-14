define(['aura/aura'], function (aura) {

  "use strict";
  /*jshint browser: true */
  /*global describe:true, it:true, before: true, sinon: true */

  var delay = function () {
    var args = arguments;
    var slice = Array.prototype.slice;
    setTimeout(function () {
      var argsArray = slice.call(args);
      argsArray.shift().apply(null, argsArray);
    }, parseInt(Math.random()*2));
  };

  var easyXDMMock = {
    Rpc: function (a1, a2) {
      console.log("constructing easyXDMMock.Rpc with params: ", arguments);
      delay(a2.local.ready, {me: {name: "test"}, app: {name: "test", org: {name: "test"}}});
    }
  };

  easyXDMMock.Rpc.prototype.message = function (conf, successCb, errorCb) {
    console.log("Calling easyXDMMock.Rpc#message with params: ", arguments);
    var cb;
    if (conf.path.indexOf('error') === 0) {
      cb = errorCb;
    } else {
      cb = successCb;
    }
    delay(cb, conf);
  };
  
  define('easyXDM', function () { return easyXDMMock;});

  describe("API specs", function () {
    var env, api, app = aura();

    var extension = {
      init: function (appEnv) {
        env = appEnv;
      }
    };

    app
      .use(extension)
      .use('lib/client/api');
    
    var initStatus = app.start();
    before(function (done) {
      initStatus.then(function () {
        api = env.core.createSandbox().data.api;
        done();
      });
    });

    it('should be available in the environment', function () {
      env.sandbox.data.should.contain.keys('api');
      api.should.be.a('function');
    });

    describe("Basic API requests", function () {
      it("should reject promise and execute failure callback with an invalid request", function (done) {
        var spySuccess = sinon.spy();
        var spyFailure = sinon.spy();
        var ret = api("error", spySuccess, spyFailure);
        ret.fail(spyFailure);
        ret.done(spySuccess);
        ret.always(function () {
          spySuccess.should.not.have.been.called;
          spyFailure.should.have.been.calledTwice;
          done();
        });
      });

      it("should resolve promise and execute success callback with a valid request", function (done) {
        var spySuccess = sinon.spy();
        var spyFailure = sinon.spy();
        var ret = api("success", spySuccess, spyFailure);
        ret.done(spySuccess);
        ret.fail(spyFailure);
        ret.always(function () {
          spySuccess.should.have.been.calledTwice;
          spyFailure.should.not.have.been.called;
          done();
        });
      });

      it("must have a string as the first parameter", function () {
        var params = [123, null, undefined, Object.create(null), {}];
        params.forEach(function (param) {
          api.bind(api, param).should.throw(TypeError);
        }); 
      });

      it("accepts a method as the second parameter", function (done) {
        var myMethod = "custom_method";
        var ret = api("success", myMethod);
        ret.done(function (params) {
          params.method.should.equal(myMethod);
          done();
        });
      });

      it("default to GET method", function (done) {
        var ret = api("success");
        ret.done(function (params) {
          params.method.should.equal('get');
          done();
        });
      });

      it("accepts only one set of additional params", function (done) {
        var additionalParams = {};
        var ret = api("success", additionalParams);
        ret.done(function (params) {
          params.params.should.be.equal(additionalParams);
          done();
        });
        api.bind(api, "success", additionalParams, additionalParams).should.throw(TypeError);
      });
    });

    describe("Method-based API", function () {
      it("appends the method to the params automatically", function (done) {
        var postPromise = api.post('service', 'path');
        postPromise.done(function (params) {
          params.method.should.equal('post');
          done();
        }); 
      });

      it("must be called with a service name and a path", function () {
        api.get.bind(api, 'path').should.throw(Error);
        api.post.bind(api, 'path').should.throw(Error);
        api.put.bind(api, 'path').should.throw(Error);
        api.del.bind(api, 'path').should.throw(Error);

        api.get.bind(api, 'service', 'path').should.not.throw(Error);
        api.post.bind(api, 'service', 'path').should.not.throw(Error);
        api.put.bind(api, 'service', 'path').should.not.throw(Error);
        api.del.bind(api, 'service', 'path').should.not.throw(Error);
      });

      it("prepends the service name to the path", function (done) {
        var promise = api.get('service', 'path', function(params) {
          params.path.should.equal('service/path');
          done();
        });
      });
    });

    describe('Models', function () {
      it("should be provided an id", function () {
        api.model.bind(api, 'anId').should.not.throw(Error);
        api.model.bind(api, {_id: 'anId'}).should.not.throw(Error);
        api.model.bind(api, {}).should.throw(Error);
      });

      it("should provide a deferred", function () {
        var model = api.model('anId');
        model.deferred.should.be.a('object');
      });

      it("should return the model when the promise is resolved", function (done) {
        var model = api.model('anId');
        model.deferred.done(function (fetchedModel) {
          fetchedModel.should.be.equal(model);
          done();
        });
      });
    });
  });
});

