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

    describe("Creating widget", function () {
      describe("the widget name", function () {
        it("should be truthy", function () {
          ['', false, null, undefined].forEach(function (v) {
            hullbase.widget.bind(undefined, v).should.throw('A widget must have a identifier');
          });
        });

        it("should be a String", function () {
          [true, [], new Date(), {}].forEach(function (v) {
            hullbase.widget.bind(undefined, v).should.throw('The widget identifier must be a String');
          });

          hullbase.widget.bind(undefined, "widget_name", {}).should.not.throw('A widget must have a identifier');
          hullbase.widget.bind(undefined, String("widget_name"), {}).should.not.throw('A widget must have a identifier');
        });
      });

      describe("the widget definition", function () {
        it("should be an Object literal or a function returning an Object literal", function () {
          hullbase.widget.bind(undefined, "widget_name").should.throw('The widget widget_name must have a definition');
          hullbase.widget.bind(undefined, "widget_name", function () {}).should.throw('The widget widget_name must have a definition');

          hullbase.widget.bind(undefined, "widget_name", {}).should.not.throw('The widget widget_name must have a definition');
          hullbase.widget.bind(undefined, "widget_name", function () { return {}; }).should.not.throw('The widget widget_name must have a definition');
        });

        it("should maintain the widget type or set 'Hull' as a default", function () {
          hullbase.widget("w1", {}).type.should.eq("Hull");
          hullbase.widget("w1", {type: "myType"}).type.should.eq("myType");
        });
      });

      it("should return the widget definition", function () {
        var widgetDef = {v: "value"};
        var definedWidget = hullbase.widget("w1", widgetDef);
        definedWidget.should.contain.keys(Object.keys(widgetDef));
        definedWidget.should.contain.key('type');
        definedWidget.type.should.equal('Hull');

        widgetDef = {type: "myType", v: "value"};
        hullbase.widget("w1", widgetDef).should.equal(widgetDef);
      });

      describe('the associated module', function () {
        it("should be defined in the default widget source", function (done) {
          var definedModule = hullbase.widget("w2", {});
          require(['__widget__$w2@default'], function (mod) {
            mod.should.equal(definedModule);
            done();
          });
        });

        it("should be defined with the widgetDefinition as its value", function (done) {
          var definedModule = hullbase.widget("w3", {});
          require(['__widget__$w3@default'], function (mod) {
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
