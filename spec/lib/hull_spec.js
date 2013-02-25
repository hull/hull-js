/*global define:true, describe:true, it:true */
define(function () {
  "use strict";

  // Mocking dependencies of  lib/hull
  before(function () {
    define('lib/hull', function () {
      return sinon.spy();
    });
    define('lib/version', function () {
      return 'Mock_Version';
    });
  });

  after(function () {
    require.undef('lib/hull');
    require.undef('lib/version');
  });

  require(['lib/hull'], function (hull) {

    describe("Initializing the application", function () {
      it("should call the module lib/hull", function () {
        var arg1 = {};
        var arg2 = {};
        var arg3 = {};
        hullbase.init(arg1, arg2, arg3);
        spy.should.have.been.calledWith(arg1, arg2, arg3);

      });
      it("should fail if the organizationUrl is missing", function (done) {
        hullbase.init({appId: "..."}, null, function () { done(); });
      });

      it("must fail if the applicationId (param: orgUrl) is missing", function (done) {
        Hull.init({orgUrl: "..."}, null, function () { done(); });
      });

      it("should run only the errback if failed", function (done) {
        var spy = sinon.spy();
        Hull.init({orgUrl: "..."}, spy, function () {
          spy.should.not.have.beenCalled;
          done();
        });
      });

      it("should run only the callback if succeeded", function (done) {
        var spy = sinon.spy();
        Hull.init({orgUrl: "...", appId: ".."}, function () {
          spy.should.not.have.beenCalled;
          done();
        }, spy);
      });

      //@TODO Does not work because Hull is a singleton, once it is started
      //      it can not be stopped
      //
      //it("should expose only some properties", function (done) {
      //  done(new Error("untested"));
      //});

      //it("should allow to specify which properties to expose additionnally", function (done) {
      //  done(new Error("untested"));
      //});
    });
  });
});
