/* global describe:true, it:true, before:true, beforeEach:true, afterEach: true, define:true */
define(['spec/support/spec_helper'], function (helpers) {
  "use strict";

  var auth,
      appMock;
  describe('The authentication module', function () {

    describe('initialization of the Auth module', function () {
      var evts;
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
  });
});
