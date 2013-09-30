  /*global describe:true, it:true, before: true, sinon: true, define: true */

define(['aura/aura'], function(aura) {
  describe('Component', function() {
    var app;
    var Component;
    var component;

    function createComponentInstance(properties) {
      var Constructor;
      if (typeof properties === 'object') {
        Constructor = Component.extend(properties);
      } else {
        Constructor = Component;
      }

      var w = new Constructor({ ref: 'fake_ref' });
      w.id = 'fake_id';
      w.options.name = 'fake_name';

      return w;
    }

    var apiMock = function(app) {
      app.core.api = function() {};
    };

    before(function (done) {
      app = aura({ appId: 'fake_app', orgUrl: 'fake_org' });
      app.use(apiMock);
      app.use('aura-extensions/aura-backbone');
      app.use('lib/client/component');
      app.start().done(function() {
        var sandbox = app.sandboxes.create();
        sandbox.config = { debug: false };
        sandbox.template = {
          load: function () {
            return $.Deferred();
          }
        };
        Component = app.core.Components.Hull.extend({ sandbox: sandbox });
        done();
      });
    });

    beforeEach(function() {
      component = createComponentInstance();
    });

    describe('Rendering the component', function () {
      it('should render immediately in the nominal scenario', function () {
        var spy = sinon.spy();
        var component = createComponentInstance({render: spy});
        spy.should.have.been.called;
      });
    });

    //TODO Move the specs into those of the aura extension
    xdescribe('Required options', function () {
      it('should render if no required options are specified', function () {
        var spy = sinon.spy();
        var component = createComponentInstance({render: spy});
        spy.should.have.been.called;
      });
      it('should render if required options are empty', function () {
        var spy = sinon.spy();
        var component = createComponentInstance({render: spy, requiredOptions: []});
        spy.should.have.been.called;
      });
      it('should render if the required options are present', function () {
        var spy = sinon.spy();
        var component = createComponentInstance({render: spy, requiredOptions: ['YEAH_BABY'], options: {YEAH_BABY: "!"}});
        spy.should.have.been.called;
      });
      it('should not render if the required options are not present', function () {
        var spy = sinon.spy();
        var component = createComponentInstance({render: spy, requiredOptions: ['YEAH_BABY']});
        spy.should.not.have.been.called;
      });
    });

    describe('#track', function() {
      var spy;
      beforeEach(function() {
        spy = component.sandbox.track = sinon.spy();
      });

      it('should be defined', function() {
        component.track.should.be.a('function');
      });

      it('should call sandbox.track', function() {
        component.track('test');
        spy.should.have.been.calledWith('test');
      });

      describe('when trackingData is an object', function() {
        it('should extend data with trackingData', function() {
          var component = createComponentInstance({ trackingData: { foo: 'bar' } });
          spy = component.sandbox.track = sinon.spy();

          component.track('test');
          var trackingData = spy.args[0][1];

          trackingData.should.have.property('foo', 'bar');
        });
      });

      describe('when trackingData is a function', function() {
        it('should extend data with object returned by trackingData', function() {
          var component = createComponentInstance({
            trackingData: function() {
              return { foo: 'bar' };
            }
          });
          spy = component.sandbox.track = sinon.spy();

          component.track('test');
          var trackingData = spy.args[0][1];

          trackingData.should.have.property('foo', 'bar');
        });
      });

      it('should extend data with component id and name', function() {
        component.track('test', { foo: 'bar' });
        var trackingData = spy.args[0][1];
        trackingData.should.deep.equal({
          id: 'fake_id',
          component: 'fake_name',
          foo: 'bar'
        });
      });
    });
  });
});
