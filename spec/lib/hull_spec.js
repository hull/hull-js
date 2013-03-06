/*global sinon:true, define:true, describe:true, it:true, before:true, after:true */
define(function () {
  "use strict";

  var hullInitFn;
  var auraStub;

  // Mocking dependencies of  lib/hull
  before(function (done) {
   console.log('globalBefore'); 
    auraStub = sinon.stub({
      use: function () { },
      start: function () { },
      stop: function () { }
    });
    auraStub.use.returns(auraStub);
    auraStub.start.returns($.Deferred().promise());
    var auraModule = sinon.spy(function () {
      return auraStub;
    });


    require.undef('aura/aura');
    require.undef('lib/hull');
    define('aura/aura', function () {
      return auraModule;
    });
    define('lib/hullbase', function () {
      return {};
    });
    require(['lib/hull', 'aura/aura', 'lib/hullbase'], function (hull) {
      hullInitFn = hull;
      done();
    });
  });

  after(function () {
    require.undef('lib/hull');
    require.undef('aura/aura');
    require.undef('lib/hullbase');
  });

  describe("Booting the application", function () {
    describe("Evaluating the module", function () {
      it("should return a function", function () {
        hullInitFn.should.be.a('Function');
      });
    });

    describe("The evaluated module", function () {
      beforeEach(function () {
        delete hullInitFn({}).app; // Forces the reset
      });
      it("should return an object with 'app' and 'config key'", function () {
        var conf = {};
        hullInitFn(conf).should.contain.keys('config');
        hullInitFn(conf).should.contain.keys('app');
      });
      it("should have an Aura application as the value of the 'app' config", function () {
        var conf = {};
        hullInitFn(conf).app.should.eql(auraStub);
      });
      it("should return the config passed to the function into the 'config' property", function () {
        var conf = {
          foo: "FOO",
          bar: "BAR",
          baz: "BAZ"
        };
        hullInitFn(conf).config.should.contain.keys(Object.keys(conf));
      });
      it("should add a 'namespace property in the onfig and set it to 'Hull'", function () {
        var conf = {};
        hullInitFn(conf).config.should.contain.keys('namespace');
        hullInitFn(conf).config.namespace.should.eql('hull');
      });
    });
  });
});
