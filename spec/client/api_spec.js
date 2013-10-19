/*global define:true */
define(['spec/support/spec_helper', 'aura/aura', 'components/underscore/underscore'], function (helper, aura) {

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

  var config = {
    appId: "fakeId",
    orgUrl: "orgUrl"
  };
  var mustFail = false;

  var easyXDMMock = {
    Rpc: function (a1, a2) {
      if (mustFail) {
        delay(a2.local.message.bind(this), {error:"Fail"});
      } else {
        delay(a2.local.ready, {services:{types:{auth:[]}},data: {me: {name: "test"}, app: {name: "test", org: {name: "test"}}}});
      }
      mustFail = false;
    }
  };

  easyXDMMock.Rpc.prototype.message = function (conf, successCb, errorCb) {
    var cb;
    if (conf.error) {
      cb = errorCb;
      conf = conf.error;
    } else if (conf.path.indexOf('error') === 0) {
      cb = errorCb;
    } else {
      cb = successCb;
    }
    delay(cb, { response: conf, headers: {} }, {});
  };

  define('easyXDM', function () { return easyXDMMock; });

  xdescribe("API specs", function () {
    var env, api, batch, app = aura(config);

    var extension = {
      initialize: function (appEnv) {
        env = appEnv;
        app.core = app.core || {};
        app.core.mvc = window.Backbone;
      }
    };

    app
      .use(extension)
      .use('lib/client/api');

    before(function(done) {
      app.start().then(function () {
        api = app.sandboxes.create().data.api;
        batch = api.batch;
        done();
      });
    });

    it('should be available in the environment', function () {
      env.sandbox.data.should.contain.keys('api');
      api.should.be.a('function');
    });

    describe("initializing the API client", function () {
      it("should reject if there's an error", function (done) {
        require(['lib/api'], function (apiClient) {
          mustFail = true;
          apiClient({appId: "please", orgUrl: "fail"}).then(
            function () {done(new Error('Error'));},
            function () {done();}
          );
        });
      });
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
    });

    describe('batching requests', function () {
      var spySuccess, spyFailure;
      beforeEach(function () {
        spySuccess = sinon.spy();
        spyFailure = sinon.spy();
      });

      it('should throw if more than 2 functions are defined', function () {
        batch.bind(undefined, function () {}, function () {}, function () {}).should.throw(Error);
      });
      it('should only accept Arrays apart from callback/errback', function () {
        batch.bind(undefined, 'url').should.throw(Error);
        batch.bind(undefined, {}).should.throw(Error);
        batch.bind(undefined, 123).should.throw(Error);
        batch.bind(undefined, null).should.throw(Error);
        batch.bind(undefined, true).should.throw(Error);
        batch.bind(undefined, []).should.not.throw(Error);
      });
      it('should execute callback when successful', function (done) {
        var ret = batch(['success'], spySuccess, spyFailure);
        ret.always(function () {
          spySuccess.should.have.been.called;
          spyFailure.should.not.have.been.called;
          done();
        });
      });
      it('should execute errback when failed', function (done) {
        var ret = batch(['error'], spySuccess, spyFailure);
        ret.always(function () {
          spySuccess.should.not.have.been.called;
          spyFailure.should.have.been.called;
          done();
        });
      });
      it('should execute callback when all requests succeed', function (done) {
        var ret = batch(['success'], ['success'], spySuccess, spyFailure);
        ret.always(function () {
          spySuccess.should.have.been.called;
          spyFailure.should.not.have.been.called;
          done();
        });
      });
      it('should execute errback when one request failed', function (done) {
        var ret = batch(['error'], ['success'], spySuccess, spyFailure);
        ret.always(function () {
          spySuccess.should.not.have.been.called;
          spyFailure.should.have.been.called;
          done();
        });
      });
      describe('individuals callbacks', function () {
        it('should call individual callbacks on success', function (done) {
          var spySuccess2 = sinon.spy(),
              spyFailure2 = sinon.spy(),
              ret = batch(['success', spySuccess, spyFailure], ['success', spySuccess2, spyFailure2]);
          ret.always(function () {
            spySuccess.should.have.been.called;
            spyFailure.should.not.have.been.called;
            spySuccess2.should.have.been.called;
            spyFailure2.should.not.have.been.called;
            done();
          });
        });
        it('should call individual errbacks on failure', function (done) {
          var ret = batch(['error', spySuccess, spyFailure]);
          ret.always(function () {
            spySuccess.should.not.have.been.called;
            spyFailure.should.have.been.called;
            done();
          });
        });
      });
    });

    describe('Models', function () {
      it("should be provided an id", function () {
        api.model.bind(api, 'anId').should.not.throw(Error);
        api.model.bind(api, {_id: 'anId'}).should.not.throw(Error);
        api.model.bind(api, {}).should.throw(Error);
      });

      it("should not be fetched", function () {
        var model = api.model(_.uniqueId());
        model._fetched.should.be.false;
      });
      it("should not provide an attached deferred to the model", function () {
        var model = api.model(_.uniqueId());
        expect(model.deferred).to.be.undefined;
      });

      it("should trigger the `sync` event when the model has been fetched", function (done) {
        var model = api.model(_.uniqueId());
        model.on('error', function (m) {
          m.should.be.equal(model);
          done();
        });
        model.on('sync', function (m) {
          m.should.be.equal(model);
          done();
        });
      });
    });

    describe('Tracking API', function () {
      it('proxies to the `track` provider', function () {
        var orig = env.core.data.api;
        var spy = env.core.data.api = sinon.spy();
        env.core.track('test');
        spy.should.have.been.called;
        spy.args[0][0].should.have.keys(['provider', 'path']);
        spy.args[0][0].provider.should.equal('track');
        spy.args[0][0].path.should.equal('test');
        spy.args[0][1].should.equal('post');
        env.core.data.api = orig;
      });
    });

    xdescribe('List of authentication providers', function () {
      beforeEach(function () {
        this.module = clientApiModule({});
      });
      it('should be accessible through a function', function () {
        var app = { core: {}, sandbox: {} };
        this.module.initialize(app);
        app.sandbox.login.provider.should.be.a('function');
      });
      it('should return the list of providers', function () {
        var app = { core: {}, sandbox: {
          config: {services: {types: {auth: ['hoola', 'hoop']}}}
        } };
        this.module.initialize(app);
        app.sandbox.login.provider().should.eql(['hoola', 'hoop']);
      });
      it('should return true if the provider in param is available', function () {
        var app = { core: {}, sandbox: {
          config: {services: {types: {auth: ['hoola', 'hoop']}}}
        } };
        this.module.initialize(app);
        app.sandbox.login.provider('hoola').should.be.true;
      });
      it('should return false if the provider in param is not available', function () {
        var app = { core: {}, sandbox: {
          config: {services: {types: {auth: ['hoola', 'hoop']}}}
        } };
        this.module.initialize(app);
        app.sandbox.login.provider('nope').should.be.false;
      });
    });
  });
});

