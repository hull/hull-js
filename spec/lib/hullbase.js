/*global define:true, describe:true, it:true */

// As hullbase.coffee defines window.Hull to allow the developer to hydrate some properties with values
// we need to cheat to ensure the non-destructiveness of those properties

window.Hull = {
  version: "testing",
  tenplates: {
    "aProp": "aValue"
  }
};

define(['lib/hullbase'], function (hullbase) {
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
  });
});
