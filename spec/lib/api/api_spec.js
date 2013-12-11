define(['squire', 'lib/utils/promises'], function (Squire, promises) {
  var _buildApiMock = function (that, done) {
    that.squire = new Squire();
    that.rpcSpy = sinon.spy(function () { return promises.deferred().promise; });
    that.domreadySpy = sinon.spy();
    that.squire.mock({
      domready: function () { return that.domreadySpy; },
      'lib/api/xdm': function () { return that.rpcSpy; },
      'lib/utils/cookies': function () {}
    })
    .store('domready')
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
      _buildApiMock(this, done);
    });
    afterEach(function () { this.squire.remove(); });
    it('should init cross-domain communication', function () {
      this.api.init({appId: 'abcd', orgUrl: 'efgh'});
      this.domreadySpy.should.have.been.calledOnce;
      this.domreadySpy.firstCall.args[0].should.be.a('function');
      this.domreadySpy.firstCall.args[0]();
      this.rpcSpy.should.have.been.called;
    });
  });

});
