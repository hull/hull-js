/*global define:true */
define(['squire', 'spec/support/spec_helper', 'lib/utils/promises'], function (Squire, helper, promises) {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

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

  describe("Sending requests", function () {
    beforeEach(function (done) {
      var xdmDfd = promises.deferred();
      var injector = new Squire();
      var self = this;
      this.rpcSpy = sinon.spy();
      var xdmConf = {
        rpc: {
          message: this.rpcSpy
        },
        config: {
          data: { headers: {} },
          settings: {}
        }
      };
      injector
      .mock('lib/api/xdm', function () {
        return xdmDfd.promise;
      })
      .mock('lib/utils/cookies', {
        set: function () {},
        remove: function () {}
      }).require(['lib/api/api'], function (apiModule) {
        var config = {
          appId: 'appId',
          orgUrl: 'orgUrl'
        }
        apiModule.init(config).then(function (api) {
          self.module = api;
          done();
        }, function (err) {
          done(err);
        });
        xdmDfd.resolve(xdmConf);
      })
    });

    describe("requesting a complete response", function () {
      it('should not request the complete payload by default', function () {
        this.module.api('endpoint');
        var args = this.rpcSpy.args[0];
        args[0].should.not.contain.key('completeResponse');
      });
      it('should request the complete payload if specified', function () {
        this.module.api({path: 'endpoint', completeResponse: true});
        var args = this.rpcSpy.args[0];
        args[0].should.contain.key('completeResponse');
      });

      it('should only send the payload if complete payload has not been asked', function (done) {
        var dfd = this.module.api('endpoint');
        var args = this.rpcSpy.args[0];
        var successCb = args[1];
        var expectedResponse = { "hey": "cool" };
        successCb({
          response: expectedResponse,
          headers: {}
        });
        dfd.then(function (res) {
          res.should.eql(expectedResponse);
          done();
        });
      });

      it('should send the body and headers if complete payload has been asked', function (done) {
        var dfd = this.module.api({path: 'endpoint', completeResponse: true});
        var args = this.rpcSpy.args[0];
        var successCb = args[1];
        var expectedResponse = { "hey": "cool" };
        var expectedHeaders = { "header1": "w00t" };
        successCb({
          response: expectedResponse,
          headers: expectedHeaders
        });
        dfd.then(function (res) {
          res.should.have.keys('response', 'headers');
          res.response.should.eql(expectedResponse);
          res.headers.should.eql(expectedHeaders);
          done();
        });
      });
    });
  });
});

