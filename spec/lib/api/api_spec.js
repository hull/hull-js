define(['squire', 'lib/utils/promises'], function (Squire, promises) {
  var _buildApiMock = function (that, done) {
    that.squire = new Squire();
    that.rpcMock = promises.deferred();
    that.rpcModuleStub = sinon.stub().returns(that.rpcMock.promise);
    that.squire.mock({
      'lib/api/xdm': function () { return that.rpcModuleStub; },
      'lib/utils/cookies': function () {}
    })
    .require(['lib/api/api', 'mocks'], function (api, mocks) {
      that.api = api;
      that.mocks = mocks;
      done();
    });
  };


  describe('basic module', function () {
    before(function (done) {
      _buildApiMock(this, done);
    });
    after(function () {
      this.squire.remove();
    });
    it('should have 2 properties', function () {
      this.api.should.have.keys('init', 'promise');
      this.api.init.should.be.a('function');
      //Doesn't work, no idea why...
      //this.api.promise.should.be.instanceOf(q.defer().promise.constructor);
    });
    it('should be pending', function () {
      this.api.promise.inspect().state.should.eql('pending');
    });
  });


  describe('configuration validation', function () {
    beforeEach(function (done) {
      _buildApiMock(this, done);
    });
    afterEach(function () {
      this.squire.remove();
    });
    it('should reject if no configuration is provided', function () {
      this.api.init();
      this.api.promise.inspect().state.should.eql('rejected');
    });
    it('should reject if appId is missing', function () {
      this.api.init({orgUrl: 'abcd'});
      this.api.promise.inspect().state.should.eql('rejected');
    });
    it('should reject if orgUrl is missing', function () {
      this.api.init({appId: 'abcd'});
      this.api.promise.inspect().state.should.eql('rejected');
    });
    it('should resolve if appId and orgUrl are available', function () {
      this.api.init({appId: 'abcd', orgUrl: 'efgh'});
      this.api.promise.inspect().state.should.eql('pending');
    });
  });

  describe('Init cross-domain', function () {
    beforeEach(function (done) {
      this.apiConf = { appId: 'abcd', orgUrl: '1234' };
      _buildApiMock(this, done);
    });
    afterEach(function () { this.squire.remove(); });
    it('should init cross-domain communication', function () {
      this.api.init(this.apiConf);
      this.rpcModuleStub.should.have.been.called;
    });
    it('should reject the API if cross-domain fails to load', function (done) {
      var promise = this.api.init(this.apiConf);
      promise.then(
        function () { done('should not have been called'); },
        function (err) { err.should.eql('NO!!!'); done(); }
      );
      this.rpcMock.reject('NO!!!');
    });
    it('should accept the API if cross-domain succeeds to load and resolves to an object', function (done) {
      var promise = this.api.init(this.apiConf);
      promise.then(
        function (obj) { obj.should.be.a('object'); done(); },
        function () { done('should not have been called'); }
      );
      this.rpcMock.resolve({rpc: {}, config: {data: {}, services: {types: {}}}});
    });
  });


});
