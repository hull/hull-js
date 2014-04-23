/*global define:true, beforeEach:true */
define(['squire', 'jquery'], function(Squire, jquery) {

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

  describe('Template loader', function () {
    beforeEach(function (done) {
      var that = this;
      this.app = {
        core: {
          dom: {
            find: function (sel, ctx) {
              ctx = ctx || document; //TODO fix in Aura
              return jquery(ctx).find(sel);
            }
          }
        },
        components: {
          before: sinon.spy()
        }
      };
      var injector = new Squire();
      this.compileStub = sinon.stub().returns(42);
      this.templateStub = sinon.stub().returns(123);
      this.registerPartialStub = sinon.stub();
      this.registerHelperStub = sinon.stub();
      this.requireStub = sinon.stub();
      injector.mock({
        'lib/utils/handlebars': {
          compile: this.compileStub,
          template: this.templateStub,
          registerPartial: this.registerPartialStub,
          registerHelper: this.registerHelperStub
        }
      }).require(['lib/client/component/templates'], function (module) {
        that.module = module;
        that.module.initialize(that.app);
        done();
      });
    });
    describe("Check the correct loading of the module", function() {
      it("should hook before initialize", function () {
        this.app.components.before.should.have.been.called;
        this.app.components.before.args[0][0].should.eql('initialize');
        this.app.components.before.args[0][1].should.be.a('function');
      });
    });

    describe("Order of precedence", function () {
      var tplContents = "That's a DOM template!";
      before(insertTemplateHelper('fixtures/test1', tplContents));

      it("should prefer DOM over server-template", function (done) {
        var that = this;
        var ret = this.module.load('test1', 'fixtures');
        ret.done(function (tpls) {
          tpls.should.have.keys('test1');
          tpls.test1.should.eql(42);
          that.compileStub.should.have.been.calledWith(tplContents)
          that.registerPartialStub.should.have.been.calledWith('fixtures/test1', 42);
          done();
        });
      });

      it("should prefer inner-templates over DOM", function (done) {
        var innerTpl = "I'm in!";
        var $elt = jquery('<div>');
        var that = this;
        $elt.appendTo('body');
        $elt.append(createTemplate('fixtures/test1', innerTpl));

        var ret = this.module.load('test1', 'fixtures', $elt.get(0));
        ret.done(function (tpls) {
          tpls.should.have.keys('test1');
          that.compileStub.should.have.been.calledWith(innerTpl)
          done();
        });
      });
    });

    describe("Multiple template loading", function () {
      before(insertTemplateHelper("multiple/tpl1", "First template"));
      before(insertTemplateHelper("multiple/tpl2", "Second template"));

      it("should load an array of templates", function (done) {
        var ret = this.module.load(["tpl1", "tpl2"], "multiple");
        ret.done(function (tpls) {
          tpls.should.contain.keys("tpl1");
          tpls.should.contain.keys("tpl2");
          done();
        });
      });
    });
  });

  describe("Template loader", function() {
    var app;
    //FIXME This does not work with phantomjs... DAMN
    describe("Error management", function () {
      xit("should fail the promise", function (done) {
        var promise = module.load("does_not_exist", "test");
        promise.always(function () {
          var state = promise.state();
          state.should.equal("rejected");
          done();
        });
      });
      describe("DOM loading", function () {
        var tplName = "tpl1";
        var prefix = "DOM";
        var hullTemplateName = prefix + "/" + tplName;
        var templateContents = "Woow, what a template!";

        before(insertTemplateHelper(hullTemplateName, templateContents));

        it("should contain the template as the return value of the promise", function (done) {
          var ret = this.module.load(tplName, prefix);
          var that = this;
          ret.done(function (ret) {
            ret.should.contain.keys('tpl1');
            ret.tpl1.should.eql(that.compileStub.returnValue);
            that.compileStub.should.have.been.calledWith(templateContents)
            done();
          });
        });
      });

      describe("Server loading", function () {
        it("should use require to fetch the necessary templates", function () {
          this.module.require = sinon.stub().returns('REQUIRE')
          var ret = this.module.load('test', 'fixtures');
          this.module.require.should.have.been.called;
        });
      });
    });
  });
});
