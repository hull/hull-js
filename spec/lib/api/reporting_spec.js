define([, 'squire'], function (reporting, Squire) {
  function _initModule () {
    this.apiReturn = Math.random();
    this.apiMock = {
      api: sinon.stub().returns(this.apiReturn)
    };
    this.initializedModule = this.module.init(this.apiMock);
  }

  describe("Reporting wrapper for the API", function () {
    beforeEach(function (done) {
      var injector = new Squire();
      var that = this;
      injector.require(['lib/api/reporting'], function (reporting) {
        that.module = reporting;
        done();
      });
    });
    it('should have a getter and an init', function () {
      this.module.should.have.keys('init');
    });
    describe('initialization', function () {
      it('should return an object on init', function () {
        this.module.init({}).should.be.an('object');
      });
      it('should not throw when initialized', function () {
        this.module.init({});
      });
    });
    describe('Using tracking', function () {
      beforeEach(_initModule);
      it('should proxy to the api module', function () {
        this.initializedModule.track('yep', {});
        this.apiMock.api.should.have.been.called;
      });
      it('should return from the API', function () {
        var ret = this.initializedModule.track('yep', {});
        ret.should.be.eql(this.apiReturn);
      });
      it('should call the "track" provider for the api module', function () {
        this.initializedModule.track('yep', {yop: 'yop'});
        this.apiMock.api.args[0][0].should.be.an('object');
        this.apiMock.api.args[0][0].should.have.keys('path', 'provider');
        this.apiMock.api.args[0][0].provider.should.eql('track');
        this.apiMock.api.args[0][0].path.should.eql('yep');

        this.apiMock.api.args[0][1].should.eql('post');

        this.apiMock.api.args[0][2].should.contain.keys('url', 'referrer');
        this.apiMock.api.args[0][2].should.contain.keys('yop');
      });
    });
    describe('Using flagging', function () {
      beforeEach(_initModule);
      it('should proxy to the api module', function () {
        this.initializedModule.flag('yep');
        this.apiMock.api.should.have.been.called;
      });
      it('should return from the API', function () {
        var ret = this.initializedModule.flag('yep');
        ret.should.be.eql(this.apiReturn);
      });
      it('should call the "hull" provider for the api module', function () {
        this.initializedModule.flag('yep');
        this.apiMock.api.args[0][0].should.be.an('object');
        this.apiMock.api.args[0][0].should.have.keys('path', 'provider');
        this.apiMock.api.args[0][0].provider.should.eql('hull');
        this.apiMock.api.args[0][0].path.should.eql('yep/flag');

        this.apiMock.api.args[0][1].should.eql('post');
      });
    });
  });
});
