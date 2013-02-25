/*global define:true, describe:true, it:true, sinon:true, before:true, after:true */
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

  var spy = sinon.spy();

  after(function () {
    require.undef('lib/hull');
    require.undef('lib/version');
  });

  // Mocking dependencies of  lib/hullbase
  before(function (done) {
    define('lib/hull', function () {
      return spy;
    });
    require(['lib/hull'], function () { done(); });
  });
  before(function (done) {
    define('lib/version', function () {
      return 'Mock_Version';
    });
    require(['lib/version'], function () { done(); });
  });

  var hullbase;
  before(function (done) {
    require(['lib/hullbase'], function (_hull) {
      hullbase = _hull;
      done();
    });
  });

  describe("Initializing Hull", function () {
    it("should not override the default values for Hull.version", function () {
      hullbase.version.should.not.equal(require('lib/version'));
      hullbase.version.should.equal("testing");
    });

    it("should not override the default values for Hull.templates", function () {
      hullbase.templates.should.equal(window.Hull.templates);
    });
    
    it("should expose Hull.init", function () {
      hullbase.should.contain.key('init');
      hullbase.widget.should.be.a('function');
    });
    
    it("should expose Hull.widget", function () {
      hullbase.should.contain.key('widget');
      hullbase.widget.should.be.a('function');
    });
  });

  describe("Creating widget", function () {
    it("should be called with 2 paramaters", function () {
      hullbase.widget.bind(undefined, {}).should.throw(TypeError);
      hullbase.widget.bind(undefined, "").should.throw(TypeError);
    });

    it("should keep the widget type or set Hull as a default", function () {
      hullbase.widget("w1", {}).type.should.eq("Hull");
      hullbase.widget("w1", {type: "myType"}).type.should.eq("myType");
    });

    it("should return the augmented widget definition", function () {
      var widgetDef = {type: "myType"};
      hullbase.widget("w1", widgetDef).should.equal(widgetDef);
    });

    describe("define a widget with a function", function () {
      it("should run immediately the defining function", function () {
        hullbase.widget("w1", {}).should.eql({type: "Hull"});
        var spy = sinon.spy();
        hullbase.widget("w1", function () { spy(); return {} });
        spy.should.have.beenCalled;
      });

      it("should be used with a function returning an object", function () {
        var spy = sinon.spy();
        hullbase.widget.bind(null, spy).should.throw(TypeError);
      });
    });

    // @TODO Does not work. Why?
    //
    //it("should define the module with the widgetDefinition as a value", function () {
    //  Hull.widget("w1", {});
    //  require('__widget__$w1@default').should.eql({type: "Hull"});
    //  Hull.widget("w2", function () { return {prop: "value"}; });
    //  require('__widget__$w2@default').should.eql({prop: "value", type: "Hull"});
    //  Hull.widget("w3", function () { return {type: "myType", prop: "value"}; });
    //  require('__widget__$w3@default').should.eql({prop: "value", type: "myType"});
    //});
  });

  // When the errback is not provided, an exception is thrown, supposed to be uncaught.
  // But as we are backed by requireJS, it catches it and redisplays it nicely
  // That's not a bad situation after all
  describe("Initializing the application", function () {
    console.log(require.defined('lib/version'), require.defined('lib/hull'))
    it("should call the module lib/hull", function () {
      var arg1 = {},
          arg2 = {},
          arg3 = {};
      hullbase.init(arg1, arg2, arg3);
      spy.should.have.been.called;
    });
  });
});
