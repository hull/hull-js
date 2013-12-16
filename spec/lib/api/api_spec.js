define(['squire', 'lib/utils/promises'], function (Squire, promises) {
  var _buildApiMock = function (that, after) {
    that.squire = new Squire();

    that.xdmMock = { message: function () {} };
    sinon.spy(that.xdmMock, 'message');
    that.rpcMock = promises.deferred();
    that.rpcModuleStub = sinon.stub().returns(that.rpcMock.promise);

    that.cookieStub = sinon.stub({get: function () {}, set: function () {}, remove: function () {}});

    that.paramsStub = {parse: function () {} };

    that.squire.mock({
      'lib/api/xdm': function () { return that.rpcModuleStub(); },
      'lib/utils/cookies': function () {},
      'lib/api/params': that.paramsStub,
      'lib/utils/cookies': that.cookieStub
    })
    .require(['lib/api/api', 'mocks'], function (api, mocks) {
      that.apiMod = api;
      that.mocks = mocks;
      after();
    });
  };

  var _initApi = function (that, after, data) {
    var apiConf = { appId: 'abcd', orgUrl: '1234' };
    var promise = that.apiMod.init(apiConf);
    promise.then(function (obj) { that.apiObj = obj; after(); });
    that.rpcMock.resolve({rpc: that.xdmMock, config: {data: data || {}, services: {types: {}}}});
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
        done();
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

    it('should have methods per HTTP method', function () {
      var apiFn = this.apiObj.api;
      var methods = ['get', 'post', 'put', 'delete'];
      methods.forEach(function (m) {
        apiFn[m].should.be.a('function');
      });
    });

    it('should have methods per HTTP method', function () {
      var apiFn = this.apiObj.api;
      var methods = ['get', 'post', 'put', 'delete'];
      methods.forEach(function (m) {
        apiFn[m].should.be.a('function');
      });
    });

    describe('Communicating with XDM', function () {
      it('should delegate to XDM handler', function () {
        this.apiObj.api('YOU_RL');
        this.xdmMock.message.should.have.been.called;
      });
      it('should send parsed params to XDM handler', function () {
        var dummyParsedParams = [{ a: 'B', c: 'D' }];
        sinon.stub(this.paramsStub, 'parse');
        this.paramsStub.parse.returns(dummyParsedParams);
        this.apiObj.api('YOU_RL');
        this.xdmMock.message.should.have.been.calledWith(dummyParsedParams[0]);
        this.xdmMock.message.args[0][1].should.be.a('function');
        this.xdmMock.message.args[0][2].should.be.a('function');
      });

      //FIXME I can't test instanceof on promises. What's wrong?
      xit('should return a promise', function () {
        this.apiObj.api('YOU_RL').should.be.instanceOf(promises.deferred().promise.constructor);
      });

      it('should send parsed params to XDM handler', function (done) {
        var dummyParsedParams = [{ a: 'B', c: 'D' }, function () {}, function () {}];
        sinon.stub(this.paramsStub, 'parse');
        this.paramsStub.parse.returns(dummyParsedParams);
        var promise = this.apiObj.api('YOU_RL');
        promise.then(function () { done(); }, function () { done('fail'); } );
        this.xdmMock.message.args[0][1](); // success callback
      });
    });
  });

  describe('Authentication-related features', function () {
    describe('defines auth Scope', function () {
      it('should provide an empty authScope without the header', function (done) {
        var data = { headers: { } };
        var that = this;
        var _after = function () {
          that.apiObj.authScope.should.eql('');
          done();
        };
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
      it('should provide an authScope if the header is available', function (done) {
        var data = { headers: { 'Hull-Auth-Scope': 'Youpi:Super' } };
        var that = this;
        var _after = function () {
          that.apiObj.authScope.should.eql('Youpi');
          done();
        }
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
    })

    describe(' authentication cookie', function () {
      it('should not set a cookie if the response does not contain required headers', function (done) {
        var data = { headers: { } };
        var that = this;
        var _after = function () {
          that.cookieStub.set.should.not.have.been.called;
          done();
        };
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
      it('should not set a cookie if the response contains only the header Hull-User-Id', function (done) {
        var data = { headers: { 'Hull-User-Id': 'ABCD'} };
        var that = this;
        var _after = function () {
          that.cookieStub.set.should.not.have.been.called;
          done();
        };
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
      it('should not set a cookie if the response contains only the header Hull-User-Sig', function (done) {
        var data = { headers: { 'Hull-User-Sig': 'ABCD' } };
        var that = this;
        var _after = function () {
          that.cookieStub.set.should.not.have.been.called;
          done();
        };
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
      it('should set a cookie if the response contains both headers', function (done) {
        var data = { headers: { 'Hull-User-Sig': 'ABCD', 'Hull-User-Id': 'ABCD' } };
        var that = this;
        var _after = function () {
          that.cookieStub.set.should.have.been.called;
          that.cookieStub.set.should.have.been.calledWith('hull_abcd');
          done();
        };
        _buildApiMock(this, _initApi.bind(undefined, this, _after, data));
      });
    });

  });
});
