/*global beforeEach:true, define:true, describe:true, it:true, sinon:true, before:true*/
define(function () {
  "use strict";

  // As hullbase.coffee defines window.Hull to allow the developer to hydrate some properties with values
  // we need to cheat to ensure the non-destructiveness of those properties

  window.Hull = {
    version: "testing",
    templates: {
      "aProp": "aValue"
    }
  };

  describe('Hull global wrapper', function () {
    var hullbase;
    before(function (done){
      require(['lib/hullbase'], function (base) {
        hullbase = base;
        done();
      });
    });

    describe("Hull base module", function () {
      it('should be exposed as window.Hull', function () {
        hullbase.should.equal(window.Hull);
      });
    });

    describe("Creating component", function () {

      describe("the component definition", function () {
        it("should be an Object literal or a function returning an Object literal", function () {
          hullbase.component.bind(undefined, "component_name").should.throw('A component must have a definition');
          hullbase.component.bind(undefined, "component_name", function () {}).should.throw('A component must have a definition');

          hullbase.component.bind(undefined, "component_name", {}).should.not.throw('The component component_name must have a definition');
          hullbase.component.bind(undefined, "component_name", function () { return {}; }).should.not.throw('The component component_name must have a definition');
        });

        it("should maintain the component type or set 'Hull' as a default", function () {
          hullbase.component("w1", {}).type.should.eq("Hull");
          hullbase.component("w1", {type: "myType"}).type.should.eq("myType");
        });
      });

      it("should return the component definition", function () {
        var component = hullbase.component('c1', { name: 'Huller' });
        component.type.should.equal('Hull');
        component.name.should.equal('Huller');

        var definition = { type: 'MyType' };
        hullbase.component('c2', definition).should.equal(definition);
      });

      describe('the associated module', function () {
        it("should be defined in the default component source", function (done) {
          var definedModule = hullbase.component("w2", {});
          require(['__component__$w2@default'], function (mod) {
            mod.should.equal(definedModule);
            done();
          });
        });

        it("should be defined with the componentDefinition as its value", function (done) {
          var definedModule = hullbase.component("w3", {});
          require(['__component__$w3@default'], function (mod) {
            mod.should.equal(definedModule);
            done();
          });
        });
      });
    });

    // When the errback is not provided, an exception is thrown, supposed to be uncaught.
    // But as we are backed by requireJS, it catches it and redisplays it nicely
    // That's not a bad situation after all
    describe("Initializing the application", function () {

      var spy = sinon.spy();
      var libHullMock = function (conf, cb, errb) {
        spy();
        cb();
      };

      // Mocking dependencies of  lib/hullbase
      beforeEach(function (done) {
        require.undef('lib/hull');
        define('lib/hull', function () { return libHullMock;});
        require(['lib/hull'], function () {
          done();
        });
      });

      it("should call the module lib/hull once it is available", function (done) {
        hullbase.init({}, function () {
          spy.should.have.been.called;
          done();
        });
      });
    });
  });
});
