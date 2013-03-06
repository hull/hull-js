  /*global describe:true, it:true, before: true, sinon: true, define: true */

define(['aura/aura'], function(aura) {
  describe('Widget', function() {
    var app;
    var Widget;
    var widget;

    function createWidgetInstance(properties) {
      var Constructor;
      if (typeof properties === 'object') {
        Constructor = Widget.extend(properties);
      } else {
        Constructor = Widget;
      }

      var w = new Constructor({ ref: 'fake_ref' });
      w.id = 'fake_id';
      w.options.name = 'fake_name';

      return w;
    }

    var datasourceExtensionStub = function(app) {
      app.core.datasource = function() {};
      app.core.datasource.prototype = {
        parse: function() {},
        fetch: function() {}
      };
    };

    before(function (done) {
      app = aura({ appId: 'fake_app', orgUrl: 'fake_org' });
      app.use(datasourceExtensionStub);
      app.use('aura-extensions/aura-backbone');
      app.use('lib/client/widget');
      app.start().done(function() {
        var sandbox = app.createSandbox();
        sandbox.config = { debug: false };
        Widget = app.core.Widgets.Hull.extend({ sandbox: sandbox });
        done();
      });
    });

    beforeEach(function() {
      widget = createWidgetInstance();
    });

    describe('#track', function() {
      var spy;
      beforeEach(function() {
        spy = widget.sandbox.track = sinon.spy();
      });

      it('should be defined', function() {
        widget.track.should.be.a('function');
      });

      it('should call sandbox.track', function() {
        widget.track('test');
        spy.should.have.been.calledWith('test');
      });

      describe('when trackingData is an object', function() {
        it('should extend data with trackingData', function() {
          var widget = createWidgetInstance({ trackingData: { foo: 'bar' } });
          spy = widget.sandbox.track = sinon.spy();

          widget.track('test');
          var trackingData = spy.args[0][1];

          trackingData.should.have.property('foo', 'bar');
        });
      });

      describe('when trackingData is a function', function() {
        it('should extend data with object returned by trackingData', function() {
          var widget = createWidgetInstance({
            trackingData: function() {
              return { foo: 'bar' };
            }
          });
          spy = widget.sandbox.track = sinon.spy();

          widget.track('test');
          var trackingData = spy.args[0][1];

          trackingData.should.have.property('foo', 'bar');
        });
      });

      it('should extend data with widget id and name', function() {
        widget.track('test', { foo: 'bar' });
        var trackingData = spy.args[0][1];
        trackingData.should.deep.equal({
          id: 'fake_id',
          widget: 'fake_name',
          foo: 'bar'
        });
      });
    });
  });
});
