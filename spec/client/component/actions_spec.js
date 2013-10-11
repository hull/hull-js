define(['lib/client/component/actions'], function (actionModule) {
  describe("Actions bindings for components", function () {
    before(function () {
      this.beforeSpy = sinon.spy();
      this.module = actionModule;
      this.appMock = {
        components: {
          before: this.beforeSpy
        }
      };
    });

    describe("Component bindings", function () {
      it("should register abefore:initialize hook", function () {
        this.module.initialize(this.appMock);
        this.beforeSpy.withArgs('initialize').should.have.been.calledOnce;
        var arg2 = this.beforeSpy.withArgs('initialize').args[0][1];
        arg2.should.be.equal(this.module.registerActions);
      });
    });

    describe("default actions", function () {
      it("should have some default actions defined", function () {
        this.module.defaultActions.should.be.a('array');
      });
    });

    describe("Registering Actions and events", function () {
      beforeEach(function () {
        this.fakeEvent = sinon.stub({
          preventDefault: function () {},
          stopPropagation: function () {},
          stopImmediatePropagation: function () {}
        });
      });
      afterEach(function () {
        this.fakeEvent.preventDefault.reset();
        this.fakeEvent.stopPropagation.reset();
        this.fakeEvent.stopImmediatePropagation.reset();
      });
      it("should create a hash of events if none are defined", function () {
        var component = {};
        this.module.registerActions.call(component);
        component.should.contain.key('events');
      });

      it("should add an event definition for Hull actions", function () {
        var component = {};
        this.module.registerActions.call(component);
        component.events.should.contain.key('click [data-hull-action]');
        component.events['click [data-hull-action]'].should.be.a('function');
      });

      it('should execute the Hull actions handler in the scope of the component', function () {
        var spy = sinon.spy(this.module, 'actionHandler');
        var component = {};
        this.module.registerActions.call(component);
        var fn = component.events['click [data-hull-action]'];
        fn(this.fakeEvent);
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledOn(component);
        spy.restore();
      });

      it("should create an `actions` entry if none is available", function () {
        var component = {};
        this.module.registerActions.call(component);
        component.should.contain.key('actions');
      });

      it("should add the default actions", function () {
        var component = {};
        this.module.registerActions.call(component);
        component.actions.should.contain.keys(this.module.defaultActions);
      });

      it("shouls not override a previously defined default action", function () {
        var fn = function () {};
        var component = {
          actions: {
            login: fn
          }
        };
        this.module.registerActions.call(component);
        component.actions.login.should.be.equal(fn);
      });

      it("should by default delegate to the methods of the sandbox", function () {
        var spy = sinon.spy();
        var component = {
          sandbox: {
            login: spy
          }
        };
        this.module.registerActions.call(component);
        component.actions.login(undefined, {data: {}});
        spy.should.have.been.calledOnce;
      });
    });

    describe("Triggering actions", function () {
      beforeEach(function () {
        this.fakeEvent = sinon.stub({
          preventDefault: function () {},
          stopPropagation: function () {},
          stopImmediatePropagation: function () {}
        });
      });

      it("should not bubble and prevent propagation of the event", function () {
        this.module.actionHandler(this.fakeEvent);
        this.fakeEvent.preventDefault.should.have.been.called;
        this.fakeEvent.stopPropagation.should.have.been.called;
        this.fakeEvent.stopImmediatePropagation.should.have.been.called;
      });
    });
  });
});
