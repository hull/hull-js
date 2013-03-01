/*global sinon:true, define:true, describe:true, it:true, before:true, after:true */
define(function () {
  "use strict";

  var hullModule;

  // Mocking dependencies of  lib/hull
  before(function () {
    require.undef('aura/aura');
    define('aura/aura', function () {
      return function () {
        console.log("lll")
        sinon.spy();
      };
    });
    define('lib/hullbase', function () {
      return {};
    });
    require(['lib/hull', 'aura/aura', 'lib/hullbase'], function (hull) {
      hullModule = hull;
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
        hullModule.should.be.a('Function');
      });
    });

    describe("The evaluated module", function () {
      it("should return the config passed to the function with an 'app' property", function () {
        var conf = {
          foo: "FOO",
          bar: "BAR",
          baz: "BAZ"
        };
        hullModule(conf).should.contain.keys(Object.keys(conf));
        hullModule(conf).should.contain.keys('app');
      });
    });
  });
});
