/* global sinon:true, describe:true, it:true, before:true, beforeEach:true, define:true */
define(['spec/support/spec_helper'], function (helpers) {
  "use strict";

  function getAppMock () {
    return {
      sandbox: {
        data: {},
        config: {
          services: {
            types: {
              auth: ['auth_provider0_app', 'auth_provider1_app']
            }
          }
        }
      },
      core: {
        mediator: {}
      }
    };
  }
  describe('The authentication module', function () {
    describe('initialization of the Auth module', function () {
      var auth,
          appMock,
          evts;
      beforeEach(helpers.reset('lib/client/auth', function (module) {
        evts = {};
        appMock = getAppMock();
        appMock.core.mediator.on = function (evt, fn) { evts[evt] = fn; };
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

    describe('Initiating the authentication process', function () {
      var authModule,
          loginFn,
          app,
          dfd;
      var resetLogin = helpers.reset('lib/client/auth', function (module) {
        app = getAppMock();
        dfd = $.Deferred();
        app.sandbox.data.deferred = function () { return dfd; };
        authModule = module(app);
        authModule.authUrl = function () { return 'auth_url'; }; //Mocks the method generating the ath URL
        authModule.authHelper = function () {return { open: function () {}}; }; //Mocks the method proceeding the remote auth
        loginFn = authModule.login;
      });
      beforeEach(resetLogin);

      it('should return return the authentication value if truthy', function () {
        var authenticationValue =  'Authenticating, Bro!';
        authModule.isAuthenticating = function () { return authenticationValue; };
        loginFn().should.equal(authenticationValue);
      });

      it('should throw if no provider is given', function () {
        loginFn.bind(undefined).should.throw('The provider name must be a String');
      });

      it('should throw if the provider is unknown to the app', function () {
        loginFn.bind(undefined, 'unknown_provider').should.throw('No authentication service unknown_provider configured for the app');
      });

      it('should set an authenticated state to the module and return it', function () {
        var state = loginFn('auth_provider0');
        state.should.equal(authModule.isAuthenticating());
        state.should.equal(dfd);
      });

      it('should set the lower-cased provider as a property of the state', function () {
        var provider = 'Auth_Provider1';
        var state = loginFn(provider);
        state.providerName.should.not.equal(provider);
        state.providerName.should.equal(provider.toLowerCase());
      });

      it('should execute the callback when the authentication is done', function () {
        var spy = sinon.spy();
        loginFn('auth_Provider1', {}, spy);
        dfd.resolve();
        spy.should.have.beenCalled;
      });
    });

    describe('The authentication callback', function () {
      var authModule, appMock;
      var resetLogin = helpers.reset('lib/client/auth', function (module) {
        appMock = getAppMock();
        authModule = module(appMock);
        authModule.authUrl = function () { return 'auth_url'; }; //Mocks the method generating the ath URL
        authModule.authHelper = function () {return { open: function () {}}; }; //Mocks the method proceeding the remote auth
        appMock.sandbox.data.deferred = function () { return $.Deferred(); };
        appMock.sandbox.data.api = {
          model: sinon.spy()
        };
      });
      beforeEach(resetLogin);

      it("should return immediately if no authentication process is in progress", function () {
        expect(authModule.onCompleteAuth()).to.be.undefined;
      });

      it("should fetch the model for the current user", function () {
        var dfd = $.Deferred();
        dfd.state = function () {return 'pending'; };
        authModule.isAuthenticating = function () { return dfd; };
        authModule.onCompleteAuth();
        appMock.sandbox.data.api.model.should.have.been.called;
      });
    });
  });
});
