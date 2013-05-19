/*global sinon:true, define:true, describe:true, it:true, after:true, beforeEach:true */
define(['../support/mocks/app'], function (appMock) {
  "use strict";

  describe('hull main module', function () {
    // Mocking dependencies of  lib/hull
    beforeEach(appMock.createApp);

    after(function () {
      appMock.resetApp();
      require.undef('lib/hull');
      require.undef('aura/aura');
      require.undef('lib/hullbase');
    });

    describe("Booting the application", function () {
      it("should return a function", function () {
        appMock.hullInit.should.be.a('Function');
      });
    });

    describe("Evaluating the module", function () {
      beforeEach(appMock.resetApp);

      it("should return an object with 'app' and 'config key'", function () {
        var conf = {};
        appMock.hullInit(conf).should.contain.keys('config');
        appMock.hullInit(conf).should.contain.keys('app');
      });
      it("should have an Aura application as the value of the 'app' config", function () {
        var conf = {};
        appMock.hullInit(conf).app.should.eql(appMock.app);
      });
      it("should return the config passed to the function into the 'config' property", function () {
        var conf = {
          foo: "FOO",
          bar: "BAR",
          baz: "BAZ"
        };
        appMock.hullInit(conf).config.should.contain.keys(Object.keys(conf));
      });
      it("should add a 'namespace property in the onfig and set it to 'Hull'", function () {
        var conf = {};
        appMock.hullInit(conf).config.should.contain.keys('namespace');
        appMock.hullInit(conf).config.namespace.should.eql('hull');
      });
    });

    describe("should give feedback", function () {
      beforeEach(appMock.resetApp);

      it("should throw an exception if the init fails and no errback is provided", function (done) {
        appMock.initDeferred.always(function () { done(); });
        try {
          appMock.hullInit({});
        } catch (e) {
          done();
        }
        appMock.initDeferred.reject();
      });

      it("should execute the errback in case of error", function () {
        appMock.app.start.returns(appMock.initDeferred);
        var errb = sinon.spy();
        appMock.hullInit({}, null, errb);
        appMock.initDeferred.reject();
        errb.should.have.been.called;
      });

      it("should execute the callback in case of success", function () {
        appMock.app.start.returns(appMock.initDeferred);
        var cb = sinon.spy();
        appMock.hullInit({}, cb);
        appMock.initDeferred.resolve();
        cb.should.have.been.called;
        cb.should.have.been.calledWith(window.Hull);
      });

      it("should trigger an event when the app is started", function () {
        appMock.app.start.returns(appMock.initDeferred);
        appMock.sandbox.emit = sinon.spy();
        appMock.hullInit({});
        appMock.initDeferred.resolve();
        cb.should.have.been.called;
        cb.should.have.been.calledWith('hull.started');
      });
    });

  });
});
