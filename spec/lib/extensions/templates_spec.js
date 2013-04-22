define(['spec/support/spec_helper', 'jquery'], function(helpers, jquery) {

  'use strict';
  /*jshint browser: true */
  /*global describe:true, it:true, before: true, sinon: true */


  /**
   * Writes a template into the DOM
   */
  function insertTemplateHelper (name, contents) {
    return function () {
      var elt = document.createElement('script');
      elt.id = "test_template";
      elt.type = "text/whatever";
      elt.setAttribute("data-hull-template", name);
      elt.innerHTML = contents;
      document.body.appendChild(elt);
    };
  }


  describe("Template loader", function() {
    var app,
        module;
    beforeEach(helpers.reset('lib/client/templates', function (mod) {
      module = mod;
    }));
    beforeEach(function () {
      app = {
        core: {
          data: {
            deferred: jquery.Deferred
          },
          dom: {
            find: jquery
          },
          template: {}
        }
      };
    });
    describe("Check the correct loading of the module", function() {
      it("should contain a load function", function () {
        module.initialize(app);
        app.core.template.load.should.be.a("function");
      });
    });

    // This does not work with phantomjs... DAMN
    // describe("Error management", function () {
    //   it("should fail the promise", function (done) {
    //     var promise = env.core.template.load("does_not_exist", "test");
    //     promise.always(function () {
    //       var state = promise.state();
    //       state.should.equal("rejected");
    //       done();
    //     });
    //   });
    // });

    describe("DOM loading", function () {
      var tplName = "tpl1";
      var prefix = "DOM";
      var hullTemplateName = prefix + "/" + tplName;
      var templateContents = "Woow, what a template!";

      before(insertTemplateHelper(hullTemplateName, templateContents));

      it("should contain the template as the return value of the promise", function (done) {
        module.initialize(app);
        var ret = app.core.template.load(tplName, prefix);
        var spy = sinon.spy(function (ret) {
          ret.should.contain.keys('tpl1');
          ret.tpl1.should.be.a('function');
          ret.tpl1().should.equal(templateContents);
          done();
        });
        ret.done(spy);
      });
    });

    describe("Server loading", function () {
      it("should use require to fetch the necessary templates", function (done) {
        module.initialize(app);
        var ret = app.core.template.load('test', 'fixtures');
        var spy = sinon.spy(done.bind(null, null));
        ret.done(spy);
        ret.done(function (tpls) {
          arguments.should.have.length(1);
          tpls.should.be.a('object');
          tpls.should.have.key('test');
          tpls.test.should.be.a('function');
        });
      });
    });

    describe("Order of precedence", function () {
      var tplContents = "That's a DOM template!";
      before(insertTemplateHelper('fixtures/test1', tplContents));

      it("should prefer DOM over server-template", function () {
        module.initialize(app);
        var ret = app.core.template.load('test1', 'fixtures');
        ret.done(function (tpls) {
          tpls.should.have.keys('test1');
          tpls.test1.should.be.a('function');
          tpls.test1().should.equal(tplContents);
        });
      });
    });

    describe("Multiple template loading", function () {
      before(insertTemplateHelper("multiple/tpl1", "First template"));
      before(insertTemplateHelper("multiple/tpl2", "Second template"));

      it("should load an array of templates", function () {
        module.initialize(app);
        var ret = app.core.template.load(["tpl1", "tpl2"], "multiple");
        ret.done(function (tpls) {
          tpls.should.contain.keys("tpl1");
          tpls.should.contain.keys("tpl2");
        });
      });
    });
  });
});
