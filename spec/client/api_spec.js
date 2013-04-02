/*global define:true */
define(['aura/aura'], function (aura) {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

  var delay = function () {
    var args = arguments;
    var slice = Array.prototype.slice;
    setTimeout(function () {
      var argsArray = slice.call(args);
      argsArray.shift().apply(null, argsArray);
    }, parseInt(Math.random() * 2, 10));
  };

  var easyXDMMock = {
    Rpc: function (a1, a2) {
      delay(a2.local.ready, {data: {me: {name: "test"}, app: {name: "test", org: {name: "test"}}}});
    }
  };

  easyXDMMock.Rpc.prototype.message = function (conf, successCb, errorCb) {
    var cb;
    if (conf.path.indexOf('error') === 0) {
      cb = errorCb;
    } else {
      cb = successCb;
    }
    delay(cb, conf, {});
  };

  define('easyXDM', function () { return easyXDMMock; });

  describe("API specs", function () {
    var env, api, app = aura({
      appId: "fakeId",
      orgUrl: "orgUrl"
    });

    var extension = {
      initialize: function (appEnv) {
        env = appEnv;
      }
    };

    app
      .use(extension)
      .use('lib/client/api');

    var initStatus = app.start();
    before(function (done) {
      initStatus.then(function () {
        api = env.createSandbox().data.api;
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

      it("extends params one set after the other", function (done) {
        var additionalParams = {limit: 10};
        var ret = api("success", additionalParams, {limit: 5});
        ret.done(function (params) {
          params.params.should.be.eql({limit: 5});
          done();
        });
        api.bind(api, "success", additionalParams, {limit: 5}).should.not.throw(TypeError);
      });
    });

    describe("Method-based API", function () {
      it("takes hull as the default provider", function (done) {
        api.get("/path").done(function (params) {
          params.path.should.equal("hull/path");
          done();
        });
      });

      it("accepts an object to describe the provider", function (done) {
        api.get({path: "/path", provider: "facebook"}).done(function (params) {
          params.path.should.equal("facebook/path");
          done();
        });
      });

      it("defaults the provider to hull even with an object", function (done) {
        api.get({path: "/path"}).done(function (params) {
          params.path.should.equal('hull/path');
          done();
        });
      });

      it("appends the method to the params automatically", function (done) {
        var postPromise = api.post('/path');
        postPromise.done(function (params) {
          params.method.should.equal('post');
          done();
        });
      });

      it("can be passed default params for the requests", function (done) {
        var additionalParams = {limit: 10};
        api.get({path: '/path', provider: 'me', params: additionalParams}, function (params) {
          params.should.contain.keys('params');
          params.params.should.eql(additionalParams);
          done();
        });
      });

      it("can bypass additional parameters with an object", function (done) {
        var additionalParams = {limit: 10, page: 3};
        api.get({path: '/path', provider: 'me', params: additionalParams}, {limit: 5}).done(function (params) {
          params.params.should.contain.keys(['limit', 'page']);
          params.params.limit.should.equal(5);
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

