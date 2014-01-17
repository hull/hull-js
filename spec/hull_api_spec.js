define(['squire', 'lib/utils/promises'], function (Squire, promises) {
  describe('Building the API flavour of Hull', function () {
    beforeEach(function (done) {
      this.squire = new Squire();
      this.apiDeferred = promises.deferred();
      this.reportingMock = {
        track: function () {},
        flag: function () {}
      };
      this.emitterMock = {
        on: function () {},
        off: function () {},
        emit: function () {}
      };
      this.entityMock = {};
      this.squire.mock({
        'lib/utils/emitter': function () {
          return this.emitterMock;
        }.bind(this),
        'lib/api/api': {
          init: sinon.stub().returns(this.apiDeferred.promise)
        },
        'lib/utils/entity': this.entityMock,
        'lib/api/reporting': {
          init: function () {
            return this.reportingMock;
          }.bind(this)
        }
      });
      this.squire.require(['lib/hull.api'], function (api) {
        this.hullApi = api;
        done();
      }.bind(this));
    });
    afterEach(function () {
      this.squire.remove();
    });

    it('should have the 3 required methods to boostrap', function () {
      this.hullApi.should.have.keys('init', 'success', 'failure');
      this.hullApi.init.should.be.a('function');
      this.hullApi.success.should.be.a('function');
      this.hullApi.failure.should.be.a('function');
    });

    describe('initialising the flavour', function () {
      it('should return a promise', function () {
        var ret = this.hullApi.init({});
        ret.should.be.an('object');
        ret.should.contain.property('then');
        ret.then.should.be.a('function');
      });
      it('should resolve to a description of the flavour', function (done) {
        var ret = this.hullApi.init({});
        var rawApi = { api: function () {}, auth: { logout: function () {} } };
        this.apiDeferred.resolve(rawApi);
        ret.then(function (flavour) {
          flavour.should.be.an('object');
          var expectedKeys = ['raw', 'api', 'eventEmitter'];
          flavour.should.have.keys(expectedKeys);
          flavour.raw.should.eql(rawApi);
          flavour.eventEmitter.should.eql(this.emitterMock);
          flavour.api.should.be.an('object');
          done();
        }.bind(this), done);
      });
    });
    describe('interface of the API flavour', function () {
      beforeEach(function (done) {
        var ret = this.hullApi.init({});
        this.rawApi = { api: function () {}, auth: { logout: function () {} } };
        this.apiDeferred.resolve(this.rawApi);
        ret.then(function (flavour) {
          this.flavour = flavour.api;
          done();
        }.bind(this), done);
      });
      it('should provide the interface for the API flavour in the "api" key', function () {
        var expectedKeys = ['currentUser', 'config', 'on', 'api', 'off', 'emit', 'track', 'flag', 'login', 'logout', 'util'];
        this.flavour.should.have.keys(expectedKeys);
      });
      it('should expose the EventEmitter methods', function () {
        this.flavour.on.should.eql(this.emitterMock.on);
        this.flavour.off.should.eql(this.emitterMock.off);
        this.flavour.emit.should.eql(this.emitterMock.emit);
      });
      it('should expose the reporting methods', function () {
        this.flavour.track.should.eql(this.reportingMock.track);
        this.flavour.flag.should.eql(this.reportingMock.flag);
      });
      it('should expose some utils', function () {
        this.flavour.util.entity.should.eql(this.entityMock);
        this.flavour.util.eventEmitter.should.eql(this.emitterMock);
      });
      it('should expose the config getter method', function () {
        this.flavour.config.should.be.a('function');
      });
      it('should expose the raw api method as the "api" property', function () {
        this.flavour.api.should.eql(this.rawApi.api);
      });
      it('should expose a method to create a new api flavour', function (done) {
        this.flavour.api.should.have.key('create');
        this.flavour.api.create.should.be.a('function');
        var newInstance = this.flavour.api.create({});
        this.apiDeferred.resolve(this.rawApi);
        newInstance.then(function (ret) {
          ret.api.should.have.keys(Object.keys(this.flavour));
          done();
        }.bind(this));
      });
    });
    describe('Success callback', function () {
      before(function () {
        this.fake = {key1: {}, key2: {}, api: {}, raw: { remoteConfig: { data: {} } } };
      });
      it('should have a context and exports', function () {
        this.hullApi.success(this.fake).should.have.keys('context', 'exports');
      });
      it('exports should be the raw api', function () {
        this.hullApi.success(this.fake).exports.should.eql(this.fake.api);
      });
      it('context should provide info for me/app/org', function () {
        this.hullApi.success(this.fake).context.should.have.keys('me', 'app', 'org');
      });
    });
  });
});
