/*global define:true */
define(function () {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

  describe("API module", function () {
    before(function (done) {
      require.undef('lib/api');
      define('lib/api', function () { return {};});
      var self = this;
      require(['lib/client/api'], function (module) {
        self.module = module;
        done();
      });
    });

    beforeEach(function () {
      this.appMock = {
        core: {
          data: {
            deferred: sinon.spy(function () {
              return {
                __deferred__: true,
                resolve: function () {},
                reject: function () {}
              };
            })
          }
        },
        sandbox: { data: {} },
        config: {}
      };
    });

    describe("Initialization", function () {
      it('should return a promise on init', function () {
        this.module.api = function () {
          return {
            then: function () {},
            fail: function () {}
          };
        };

        var initialized = this.module.initialize(this.appMock);
        this.appMock.core.data.deferred.should.have.been.calledOnce;
        initialized.should.contain.key('__deferred__');
      });

      // it("should reject if no orgUrl is available in config", function () {
      //
      // });

    });
    xit('should be available in the sandbox after init', function () {
      var resolvedSpy = sinon.spy();
      var rejectedSpy = sinon.spy();
      var stub = sinon.stub(this, 'apiMock', function () {
        return { then: resolvedSpy, fail: rejectedSpy };
      });
      this.module.initialize(this.appMock);
      resolvedSpy.should.have.been.calledOnce;
      //We simulate the resolution
      resolvedSpy.args[0][0]();

      this.appMock.sandbox.data.should.contain.key('api');
      this.appMock.sandbox.data.api.should.be.a('function');
    });

    xdescribe("initializing the API client", function () {
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

    xdescribe("Basic API requests", function () {
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

    xdescribe('batching requests', function () {
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

    xdescribe('Models', function () {
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

  });
});

