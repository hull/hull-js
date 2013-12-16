/*global define:true, beforeEach:true */
define(['spec/support/spec_helper', 'jquery', 'lib/client/component/templates'], function(helpers, jquery, module) {

  'use strict';
  /*jshint browser: true */
  /*global describe:true, it:true, before: true, sinon: true */

  function createTemplate (name, contents) {
    var elt = document.createElement('script');
    elt.id = "test_template";
    elt.type = "text/whatever";
    elt.setAttribute("data-hull-template", name);
    elt.innerHTML = contents;
    return elt;
  }

  /**
   * Writes a template into the DOM
   */
  function insertTemplateHelper (name, contents) {
    return function () {
      document.body.appendChild(createTemplate(name, contents));
    };
  }


  describe("Template loader", function() {
    var app;
    beforeEach(function () {
      this.app = {
        core: {
          data: {
            deferred: jquery.Deferred,
            when: jquery.when
          },
          dom: {
            find: function (sel, ctx) {
              ctx = ctx || document; //TODO fix in Aura
              return jquery(ctx).find(sel);
            }
          },
          template: {}
        },
        components: {
          before: sinon.spy()
        }
      };
      module.initialize(this.app);
    });
    describe("Check the correct loading of the module", function() {
      it("should hook before initialize", function () {
        this.app.components.before.should.have.been.called;
        this.app.components.before.args[0][0].should.eql('initialize');
        this.app.components.before.args[0][1].should.be.a('function');
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
        var ret = module.load(tplName, prefix);
        ret.done(function (ret) {
          ret.should.contain.keys('tpl1');
          ret.tpl1.should.be.a('function');
          ret.tpl1().should.equal(templateContents);
          done();
        });
      });
    });

    xdescribe("Server loading", function () {
      it("should use require to fetch the necessary templates", function (done) {
        var ret = module.load('test', 'fixtures');
        ret.done(function (tpls) {
          arguments.should.have.length(1);
          tpls.should.be.a('object');
          tpls.should.have.key('test');
          tpls.test.should.be.a('function');
          done();
        });
      });
    });

    describe("Order of precedence", function () {
      var tplContents = "That's a DOM template!";
      before(insertTemplateHelper('fixtures/test1', tplContents));

      it("should prefer DOM over server-template", function (done) {
        var ret = module.load('test1', 'fixtures');
        ret.done(function (tpls) {
          tpls.should.have.keys('test1');
          tpls.test1.should.be.a('function');
          tpls.test1().should.equal(tplContents);
          done();
        });
      });

      it("should prefer inner-templates over DOM", function (done) {
        var innerTpl = "I'm in!";
        var $elt = jquery('<div>');
        $elt.appendTo('body');
        $elt.append(createTemplate('fixtures/test2', innerTpl));

        var ret = module.load('test2', 'fixtures', $elt.get(0));
        ret.done(function (tpls) {
          tpls.should.have.keys('test2');
          tpls.test2.should.be.a('function');
          tpls.test2().should.equal(innerTpl);
          done();
        });
      });
    });

    describe("Multiple template loading", function () {
      before(insertTemplateHelper("multiple/tpl1", "First template"));
      before(insertTemplateHelper("multiple/tpl2", "Second template"));

      it("should load an array of templates", function (done) {
        var ret = module.load(["tpl1", "tpl2"], "multiple");
        ret.done(function (tpls) {
          tpls.should.contain.keys("tpl1");
          tpls.should.contain.keys("tpl2");
          done();
        });
      });
    });
  });
});
