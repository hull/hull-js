/*global define:true, describe:true, it:true */

// As hullbase.coffee defines window.Hull to allow the developer to hydrate some properties with values
// we need to cheat to ensure the non-destructiveness of those properties

window.Hull = {
  version: "testing",
  templates: {
    "aProp": "aValue"
  }
};

define(['lib/hullbase', 'aura/aura'], function (hullbase, Aura) {
  "use strict";
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

  // When the errback is not provided, an exception is thrown, supposed to be uncaught.
  // But as we are backed by requireJS, it catches it and redisplays it nicely
  // That's not a bad situation after all
  describe("Initializing the application", function () {
    it("must fail if the organizationUrl is missing", function (done) {
      Hull.init({appId: "..."}, null, function () { done(); });
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

  describe("Creating widget", function () {
    it("should be called with 2 paramaters", function () {
      Hull.widget.bind(undefined, {}).should.throw(TypeError);
      Hull.widget.bind(undefined, "").should.throw(TypeError);
    });

    it("should keep the widget type or set Hull as a default", function () {
      Hull.widget("w1", {}).type.should.eq("Hull");
      Hull.widget("w1", {type: "myType"}).type.should.eq("myType");
    });

    it("should return the augmented widget definition", function () {
      var widgetDef = {type: "myType"};
      Hull.widget("w1", widgetDef).should.equal(widgetDef);
    });

    describe("define a widget with a function", function () {
      it("should run immediately the defining function", function () {
        Hull.widget("w1", {}).should.eql({type: "Hull"});
        var spy = sinon.spy();
        Hull.widget("w1", function () { spy(); return {} });
        spy.should.have.beenCalled;
      });

      it("should be used with a function returning an object", function () {
        var spy = sinon.spy();
        Hull.widget.bind(null, spy).should.throw(TypeError);
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
});
