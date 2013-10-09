  /*global describe:true, it:true, before: true, sinon: true, define: true */

define(['aura/aura'], function(aura) {
  xdescribe('Component', function() {
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

  });
});
