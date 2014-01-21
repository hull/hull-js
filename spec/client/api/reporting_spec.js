/*global define:true, describe: true, it:true, beforeEach:true, sinon:true */
define(['squire'], function (Squire) {
  "use strict";
  describe('Flagging and tracking features', function () {
    beforeEach(function (done) {
      var that = this;
      this.componentMock = {
        sandbox: {},
        options: { name: 'MOCK' }
      };
      this.appMock = {
        sandbox: {},
        core: { data: { hullApi: function () {} } },
        components: {
          before: sinon.spy()
        }
      };
      this.trackSpy = sinon.spy();
      this.flagSpy = sinon.spy();
      var injector = new Squire();
      var reporting = { init: function () {} };
      var reportingStub = sinon.stub(reporting, 'init', function () { return {
        track: that.trackSpy,
        flag: that.flagSpy
      }});
      injector.mock({
        'lib/api/reporting': reporting
      }).require(['aura-extensions/hull-component-reporting'], function (module) {
        that.module = module;
        done();
      });
    });

    describe('Setting up in the components', function () {
      it("should be setup before the component's initialize method", function () {
        this.module.initialize(this.appMock);
        var before = this.appMock.components.before;
        before.should.have.been.called;
        before.should.have.been.calledWith('initialize', this.module.setup);
      });
    });
    describe('Set up tracking and flagging', function () {
      it('should set up the methods to the sandbox', function () {
        this.module.initialize(this.appMock);
        this.appMock.sandbox.track.should.be.a('function');
        this.appMock.sandbox.flag.should.be.a('function');
      });
      it('should set up the track method to the component', function () {
        this.module.setup.call(this.componentMock);
        this.componentMock.track.should.be.a('function');
      });
    });


    describe('tracking calls from the sandbox', function () {
      beforeEach(function () {
        this.module.initialize(this.appMock);
      });
      it('should proxy track to the reporting module', function () {
        this.appMock.sandbox.track('yop', {});
        this.trackSpy.should.have.been.called;
      });
      it('should proxy flag to the reporting module', function () {
        this.appMock.sandbox.flag('yop');
        this.flagSpy.should.have.been.called;
      });
    });
  });

  describe('tracking calls from a component', function () {
    beforeEach(function () {
      this.module.initialize(this.appMock);
      this.componentMock.sandbox = this.appMock.sandbox;
      this.module.setup.call(this.componentMock);
    });
    describe('when trackingData is an object', function() {
      it('should extend data with trackingData', function() {
        this.componentMock.trackingData = { foo: 'bar' };

        this.componentMock.track('test');
        var trackingEvent = this.trackSpy.args[0][0];
        var trackingData = this.trackSpy.args[0][1];

        trackingEvent.should.be.equal('test');
        trackingData.should.have.property('foo', 'bar');
      });
    });

    describe('when trackingData is a function', function() {
      it('should extend data with object returned by trackingData', function() {
        this.componentMock.trackingData = function() {
          return { foo: 'bar' };
        };
        this.componentMock.track('test');
        var trackingData = this.trackSpy.args[0][1];
        trackingData.should.have.property('foo', 'bar');
      });
    });

    it('should extend data with component id and name if available', function() {
      this.componentMock.id = 'fake_id';
      this.componentMock.options = {name: 'fake_name'};
      this.componentMock.track('test', { foo: 'bar' });
      var trackingData = this.trackSpy.args[0][1];
      trackingData.should.have.property('id', 'fake_id');
      trackingData.should.have.property('component', 'fake_name');
      trackingData.should.have.property('foo', 'bar');
    });
  });
});
