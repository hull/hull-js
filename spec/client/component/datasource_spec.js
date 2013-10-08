define(['lib/client/component/datasource'], function (module) {
  describe("Extending components with datasources", function () {
    beforeEach(function () {
      sinon.stub(module, 'datasourceModel');
      this.apiSpy = sinon.spy();
      this.beforeSpy = sinon.spy();
      this.DatasourceSpy = sinon.spy();
      this.appMock = {
        components: { before:this.beforeSpy },
        core: {data: {api: {model: this.beforeSpy}}}
      };
      this.module = module;
    });
    it("should attach the datasource injection method before Component::initialize", function () {
      this.module.initialize(this.appMock);
      this.beforeSpy.should.have.been.calledWith('initialize');
      var arg2 = this.beforeSpy.args[0][1];
      arg2.should.be.a('function');
      //Check that the function wraps the injection method
      arg2({});
    });

  });
});
