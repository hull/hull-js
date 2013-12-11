define(['squire', 'lib/utils/promises'], function (Squire, promises) {
  var _buildApiMock = function (that, after) {
    that.squire = new Squire();
    that.rpcMock = promises.deferred();
    that.rpcModuleStub = sinon.stub().returns(that.rpcMock.promise);
    that.squire.mock({
      'lib/api/xdm': function () { return that.rpcModuleStub; },
      'lib/utils/cookies': function () {}
    })
    .require(['lib/api/api', 'mocks'], function (api, mocks) {
      that.apiMod = api;
      that.mocks = mocks;
      after();
    });
  };

  var _initApi = function (that, after) {
    var apiConf = { appId: 'abcd', orgUrl: '1234' };
    var promise = that.apiMod.init(apiConf);
    promise.then(function (obj) { that.apiObj = obj; after(); });
    that.rpcMock.resolve({rpc: {}, config: {data: {}, services: {types: {}}}});
  };

  describe('basic module', function () {
    before(function (done) {
      _buildApiMock(this, done);
    });
    after(function () {
      this.squire.remove();
    });
    it('should have 2 properties', function () {
      this.apiMod.should.have.keys('init', 'promise');
      this.apiMod.init.should.be.a('function');
      //Doesn't work, no idea why...
      //this.apiMod.promise.should.be.instanceOf(q.defer().promise.constructor);
    });
    it('should be pending', function () {
      this.apiMod.promise.inspect().state.should.eql('pending');
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
      this.apiMod.init();
      this.apiMod.promise.inspect().state.should.eql('rejected');
    });
    it('should reject if appId is missing', function () {
      this.apiMod.init({orgUrl: 'abcd'});
      this.apiMod.promise.inspect().state.should.eql('rejected');
    });
    it('should reject if orgUrl is missing', function () {
      this.apiMod.init({appId: 'abcd'});
      this.apiMod.promise.inspect().state.should.eql('rejected');
    });
    it('should resolve if appId and orgUrl are available', function () {
      this.apiMod.init({appId: 'abcd', orgUrl: 'efgh'});
      this.apiMod.promise.inspect().state.should.eql('pending');
    });
  });

  describe('Init cross-domain', function () {
    beforeEach(function (done) {
      this.apiConf = { appId: 'abcd', orgUrl: '1234' };
      _buildApiMock(this, done);
    });
    afterEach(function () { this.squire.remove(); });
    it('should init cross-domain communication', function () {
      this.apiMod.init(this.apiConf);
      this.rpcModuleStub.should.have.been.called;
    });
    it('should reject the API if cross-domain fails to load', function (done) {
      var promise = this.apiMod.init(this.apiConf);
      promise.then(
        function () { done('should not have been called'); },
        function (err) { err.should.eql('NO!!!'); done(); }
      );
      this.rpcMock.reject('NO!!!');
    });
    it('should accept the API if cross-domain succeeds to load and resolves to an object', function (done) {
      var promise = this.apiMod.init(this.apiConf);
      promise.then(
        function (obj) { obj.should.be.a('object'); done(); },
        function () { done('should not have been called'); }
      );
      this.rpcMock.resolve({rpc: {}, config: {data: {}, services: {types: {}}}});
    });
    it('should resolve to the API object', function (done) {
      var that = this;
      _buildApiMock(this, _initApi.bind(undefined, this, function () {
        that.apiObj.should.have.keys('auth', 'remoteConfig', 'authScope', 'api', 'init');
        done()
      }));

    });
  });

  describe('performing requests', function () {
    beforeEach(function (done) {
      _buildApiMock(this, _initApi.bind(undefined, this, done));
    });

    it('should have a generic request function', function () {
      var apiFn = this.apiObj.api;
      apiFn.should.be.a('function');
    });

  });


});
