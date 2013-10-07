/*global define:true, describe: true, it:true, beforeEach:true, sinon:true */
define(['lib/client/api/reporting'], function (module) {
  "use strict";
  describe('Flagging and tracking features', function () {
    beforeEach(function () {
      this.appMock = {
        core: {
          data: { api: function () {} }
        },
        sandbox: {},
        components: {
          before: function () {}
        }
      };
    });

    describe('Set up tracking and flagging to the app', function () {
      it('should set up the methods to the core and api', function () {
        module.initialize(this.appMock);
        this.appMock.core.track.should.be.a('function');
        this.appMock.sandbox.track.should.be.a('function');
      });

      it('should prepare to add a track method to the components', function () {
        this.appMock.components.before = sinon.spy();

        module.initialize(this.appMock);
        this.appMock.components.before.should.have.been.calledWith('initialize', module.track);
      });
    });


    describe('Tracking from a component', function () {
      it('should add a track method to the component at init', function () {
        var component = {};
        module.track.call(component);
        component.track.should.be.a('function');
      });

      it ('should actually proxy to sandbox.track', function () {
        module.initialize(this.appMock);
        var spy = this.appMock.sandbox.track = sinon.spy();
        var component = {sandbox: this.appMock.sandbox, options: {}};
        module.track.call(component);
        component.track();
        spy.should.have.been.called;
      });
    });

    describe('tracking calls from the sandbox', function () {
      beforeEach(function () {
        this.spy = this.appMock.core.data.api = sinon.spy();
      });
      it('should call core.data.api', function () {
        module.initialize(this.appMock);
        this.appMock.core.track();
        this.spy.should.have.been.called;
      });
      it('should provide specific parameters', function () {
        module.initialize(this.appMock);
        var params = {'lots': 'of', 'great': 'stuff'};
        this.appMock.core.track('yep', params);
        this.spy.should.have.been.calledWith({
          provider: 'track',
          path: 'yep'
        }, 'post', params);
      });
    });

    describe('flagging calls from the sandbox', function () {
      beforeEach(function () {
        this.spy = this.appMock.core.data.api = sinon.spy();
      });
      it('should call core.data.api', function () {
        module.initialize(this.appMock);
        var spy = this.appMock.core.data.api = sinon.spy();
        module.initialize(this.appMock);
        this.appMock.core.flag();
        spy.should.have.been.called;
      });
    });
  });

  describe('tracking calls from a component', function () {
    beforeEach(function () {
      module.initialize(this.appMock);
      this.component = {sandbox: this.appMock.sandbox, options: {}};
      module.track.call(this.component);
      this.spy = this.component.sandbox.track = sinon.spy();
    });
    describe('when trackingData is an object', function() {
      it('should extend data with trackingData', function() {
        this.component.trackingData = { foo: 'bar' };

        this.component.track('test');
        var trackingEvent = this.spy.args[0][0];
        var trackingData = this.spy.args[0][1];

        trackingEvent.should.be.equal('test');
        trackingData.should.have.property('foo', 'bar');
      });
    });

    describe('when trackingData is a function', function() {
      it('should extend data with object returned by trackingData', function() {
        this.component.trackingData = function() {
          return { foo: 'bar' };
        };

        this.component.track('test');
        var trackingData = this.spy.args[0][1];

        trackingData.should.have.property('foo', 'bar');
      });
    });

    it('should extend data with component id and name if available', function() {
      this.component.id = 'fake_id';
      this.component.options = {name: 'fake_name'};
      this.component.track('test', { foo: 'bar', });
      var trackingData = this.spy.args[0][1];
      trackingData.should.deep.equal({
        id: 'fake_id',
        component: 'fake_name',
        foo: 'bar'
      });
    });
  });
});
