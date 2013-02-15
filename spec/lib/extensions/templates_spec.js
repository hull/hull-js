define(['aura/aura'], function(aura) {

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
    var env;
    var app = aura();
    
    var extension = {
      initialize: function (appEnv) {
        env = appEnv;
      } 
    };

    app
      .use(extension)
      .use("aura-extensions/aura-handlebars")
      .use('lib/client/templates');

    var initStatus = app.start();

    // Make sure the app is started before...
    before(function(done) {
      initStatus.then(done.bind(null, null));
    });

    describe("Check the correct loading of the module", function() {
      it("Should be available in the environment", function() {
        env.core.template.should.be.a('object');
      });
      
      it("should contain a load function", function () {
        env.core.template.load.should.be.a("function");
      });
    });

    describe("Error management", function () {
      it("should fail the promise", function (done) {
        var tplName = "doesNotExist";
        var prefix = "test";
        var ret = env.core.template.load(tplName, prefix);
        var spy = sinon.spy(done.bind(null, null));
        ret.fail(spy);
      });
    });

    describe("DOM loading", function () {
      var tplName = "tpl1";
      var prefix = "DOM";
      var hullTemplateName = prefix + "/" + tplName;
      var templateContents = "Woow, what a template!";

      before(insertTemplateHelper(hullTemplateName, templateContents));
      
      it("should contain the template as the return value of the promise", function (done) {
        var ret = env.core.template.load(tplName, prefix);
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
        var ret = env.core.template.load('test', 'fixtures');
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
        var ret = env.core.template.load('test1', 'fixtures');
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
        var ret = env.core.template.load(["tpl1", "tpl2"], "multiple"); 
        ret.done(function (tpls) {
          tpls.should.contain.keys("tpl1");
          tpls.should.contain.keys("tpl2");
        });
      });
    });
  });
});
