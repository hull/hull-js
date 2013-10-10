define(['lib/client/component/datasource'], function (module) {
  before(function () {
    this.module = module;
    this.dsModelStub = sinon.stub(module, 'datasourceModel');
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
});
