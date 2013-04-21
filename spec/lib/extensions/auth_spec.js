/* global describe:true, it:true, before:true, beforeEach:true, afterEach: true, define:true */
define(['spec/support/spec_helper'], function (helpers) {
  "use strict";

  describe('The authentication module', function () {
    describe('initialization of the Auth module', function () {
      var auth,
          appMock,
          evts;
      beforeEach(helpers.reset('lib/client/auth', function (module) {
        evts = {};
        appMock = { sandbox: {} };
        appMock.core = {
          mediator: {
            on: function (evt, fn) { evts[evt] = fn; }
          }
        };
        auth = module(appMock);
        auth.initialize();
      }));
      it('should not be authenticating', function () {
        auth.isAuthenticating.should.be.a('function');
        auth.isAuthenticating().should.be.false;
      });
      it('should expose a function `authenticating` in the sandbox', function () {
        appMock.sandbox.should.contain.keys('authenticating');
        appMock.sandbox.authenticating.should.equal(auth.isAuthenticating);
      });
      it('should expose a function `login` in the sandbox', function () {
        appMock.sandbox.should.contain.keys('login');
        appMock.sandbox.login.should.equal(auth.login);
      });
      it('should expose a function `logout` in the sandbox', function () {
        appMock.sandbox.should.contain.keys('logout');
        appMock.sandbox.logout.should.equal(auth.logout);
      });
      it('should add a listener on `hull.authComplete` event', function () {
        evts.should.have.keys(['hull.authComplete']);
        evts['hull.authComplete'].should.be.a('function');
      });
    });

    describe('The authentication URL', function () {
      var authUrlFn,
          authModule,
          config = {appId: 'appId', orgUrl: 'orgUrl'};
      before(helpers.reset('lib/client/auth', function (module) {
        authModule = module({});
        authUrlFn = authModule.authUrl;
        authModule.location = 'app_location'; //Mocks the document.location
      }));
      it('should append the callback_url and auth_referer', function () {
        authUrlFn(config, 'provider').should.eql('orgUrl/auth/provider?app_id=appId&callback_url=app_location&auth_referer=app_location');
      });
      it('should be possible to specify callback_url', function () {
        var config = {appId: 'appId', orgUrl: 'orgUrl', callback_url: 'callback_url'};
        authUrlFn(config, 'provider').should.eql('orgUrl/auth/provider?app_id=appId&callback_url=callback_url&auth_referer=app_location');
      });
      it('should append any custom options', function () {
        var config = {appId: 'appId', orgUrl: 'orgUrl'};
        var opts = {a:'0', b: '1', c:'2'};
        authUrlFn(config, 'provider', opts).should.eql('orgUrl/auth/provider?a=0&b=1&c=2&app_id=appId&callback_url=app_location&auth_referer=app_location');
      });
    });
  });
});
