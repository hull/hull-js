define(['lib/client/component/datasource'], function (module) {
  before(function () {
    this.module = module;
    this.dsModelStub = sinon.stub(module, 'datasourceModel', function () {
      this.parse = function () {};
      this.fetch = function () {
        return {
          then: function () {}
        };
      }
      return this;
    });
  });
  afterEach(function () {
    this.dsModelStub.reset();
  });

  describe("Extending components with datasources", function () {
    beforeEach(function () {
      this.beforeSpy = sinon.spy();
      this.appMock = {
        components: { before:this.beforeSpy },
        core: {data: {api: {model: function () {}}}}
      };
      this.module = module;
    });

    it("should attach the datasource injection method before Component::initialize", function () {
      this.module.initialize(this.appMock);
      this.beforeSpy.withArgs('initialize').should.have.been.calledOnce;
      var wrapper = this.beforeSpy.withArgs('initialize').args[0][1];
      wrapper.should.be.a('function');
      //Check that the function wraps the injection method
      var spy = sinon.spy(this.module, 'addDatasources');
      module.addDatasources.should.not.have.been.called;
      var scope = {}; // We need to ensure the scope is passed from the wrapper to the method of the module
      wrapper.call(scope, {});
      module.addDatasources.should.have.been.calledOnce;
      module.addDatasources.should.have.been.calledOn(scope);
      module.addDatasources.args[0][0].should.contain.keys(['me', 'app', 'org']);
      module.addDatasources.args[0][0].me.should.be.instanceOf(this.dsModelStub);
      module.addDatasources.args[0][0].app.should.be.instanceOf(this.dsModelStub);
      module.addDatasources.args[0][0].org.should.be.instanceOf(this.dsModelStub);
      spy.reset();
    });

    it("should attach the datasource resolution method before Component::render", function () {
      this.module.initialize(this.appMock);
      this.beforeSpy.withArgs('render').should.have.been.calledOnce;
      var arg2 = this.beforeSpy.withArgs('render').args[0][1];
      arg2.should.be.equal(module.fetchDatasources);
    });
  });

  describe("Default datasources", function () {
    beforeEach(function () {
      this.appMock = {
        components: { before: function () {} },
        core: {data: {api: {model: function () {}}}}
      };
      this.apiStub = sinon.stub(this.appMock.core.data.api, 'model', function (arg) {
        return arg;
      });
    });
    it('should fetch the default datasources', function () {
      this.module.initialize(this.appMock);
      this.apiStub.should.have.been.calledThrice;
      this.apiStub.withArgs('me').should.have.been.calledOnce;
      this.apiStub.withArgs('app').should.have.been.calledOnce;
      this.apiStub.withArgs('org').should.have.been.calledOnce;
    });

    it('should instanciate datasourceModels with the default datasources', function () {
      this.module.initialize(this.appMock);
      this.dsModelStub.should.have.been.calledThrice;
      this.dsModelStub.withArgs('me').should.have.been.calledOnce;
      this.dsModelStub.withArgs('app').should.have.been.calledOnce;
      this.dsModelStub.withArgs('org').should.have.been.calledOnce;
    });
  });

  describe("add datasources to the component instance", function () {
    it('should add a "datasources property"', function () {
      var scope = {};
      this.module.addDatasources.call(scope);
      scope.should.contain.key('datasources');
    });
    it('should populate the `datasources` property with Datasource instances', function () {
      var props = {
        a: true,
        b: true
      };
      var scope = {};
      this.module.addDatasources.call(scope, props);
      scope.datasources.should.contain.keys(['a', 'b']);
      scope.datasources.a.should.be.instanceOf(this.dsModelStub);
      scope.datasources.b.should.be.instanceOf(this.dsModelStub);
    });

    it('should leave Datasource instances untouched', function () {
      var props = {
        a: new this.dsModelStub()
      };
      var scope = {};
      this.module.addDatasources.call(scope, props);
      scope.datasources.should.contain.keys(['a']);
      scope.datasources.a.should.be.equal(props.a);
    });

    it('should bind to the component if property is a function', function () {
      var props = {
        a: sinon.spy()
      };
      var scope = {};
      this.module.addDatasources.call(scope, props);
      props.a();
      props.a.should.have.been.calledOn(props);
    });
  });

  describe("Datasource resolution", function () {
    describe("Determining the datasource error handler", function () {
      beforeEach(function () {
        this.defaultStub = sinon.stub(this.module, 'defaultErrorHandler');
      });
      afterEach(function () {
        this.defaultStub.restore();
      });

      it("should have a default error handler", function () {
        this.module.defaultErrorHandler.should.be.a('function');
      });

      it("should use the default error handler if none specified", function () {
        var component = {};
        var handler = this.module.getDatasourceErrorHandler("datasourceName", component);
        handler();
        this.defaultStub.should.have.been.calledOnce;
        this.defaultStub.should.have.been.calledOn(component);
      });

      it("should use the custom handler provided by the component if available", function () {
        var spy = sinon.spy();
        var component = {
          onDsError: spy
        };
        var handler = this.module.getDatasourceErrorHandler('Ds', component);
        handler();
        this.defaultStub.should.not.have.been.called;
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledOn(component);
      });

      it("should use the default handler if the component property is not a function", function () {
        var component = {
          onDsError: {}
        };
        var handler = this.module.getDatasourceErrorHandler('Ds', component);
        handler();
        this.defaultStub.should.have.been.calledOnce;
        this.defaultStub.should.have.been.calledOn(component);
      });
    });
    describe("Resolves datasources to actual data", function () {
      beforeEach(function () {
        this.whenStub = sinon.stub();
        var thenStub = this.thenStub = sinon.stub();
        this.component = {
          sandbox: { data: { when: this.whenStub } }
        };
        this.dsModelStub.restore();
        this.dsModelStub = sinon.stub(module, 'datasourceModel', function () {
          this.parse = function () {};
          this.fetch = function () {
            return {
              then: thenStub
            };
          };
          return this;
        });
      });
      afterEach(function () {
        this.dsModelStub.restore();
      });

      it("should create a `data` property on component if not available", function () {
        this.module.fetchDatasources.call(this.component);
        this.component.data.should.be.a('object');
      });
      it("should not overwrite the `data` property of the component", function () {
        var fakeData = {
          prop: "value"
        };
        this.component.data = fakeData;
        this.module.fetchDatasources.call(this.component);
        this.component.data.should.be.equal(fakeData);
      });

      it("should return a promise", function () {
        this.whenStub.returns("__promise__");
        this.module.fetchDatasources.call(this.component).should.be.equal("__promise__");
        this.whenStub.should.have.been.calledOnce;
      });

      it("should parse the options", function () {
        this.component.datasources = {
          test: new this.dsModelStub()
        };
        var spy = sinon.spy(this.component.datasources.test, 'parse');
        this.module.fetchDatasources.call(this.component);
        spy.should.have.been.called;
      });

      it("should fetch the data", function () {
        this.component.datasources = {
          test: new this.dsModelStub()
        };
        var spy = sinon.spy(this.component.datasources.test, "fetch");
        this.module.fetchDatasources.call(this.component);
        spy.should.have.been.called;
      });

      it("should add a property to the `data` property of the component if the datasource succeeds", function () {
        this.component.datasources = {
          test: new this.dsModelStub()
        };
        var result = {};
        this.module.fetchDatasources.call(this.component);
        this.thenStub.should.have.been.calledOnce;
        var successFn = this.thenStub.args[0][0];
        //We simulate a resolution of the promise
        successFn(result);
        this.component.data.should.have.key('test');
        this.component.data.test.should.equal(result);
      });

      it("should call the handler if the datasource fails", function () {
        this.component.datasources = {
          test: new this.dsModelStub()
        };
        var spy = sinon.spy(this.module, 'getDatasourceErrorHandler');
        var error = {};
        this.module.fetchDatasources.call(this.component);
        var failureFn = this.thenStub.args[0][1];
        //We simulate a resolution of the promise
        failureFn(error);
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith("test", this.component)
      });
    });
  });
});
