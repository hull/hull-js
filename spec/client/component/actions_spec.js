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

    beforeEach(function () {
      this.componentMock = {
        sandbox: {
          dom: {
            find: function () {
              return {
                data: function () {}
              };
            }
          }
        }
      };
    });

    afterEach(function () {
      this.beforeSpy.reset();
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
        this.module.registerActions.call(this.componentMock);
        var fn = this.componentMock.events['click [data-hull-action]'];
        fn(this.fakeEvent);
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledOn(this.componentMock);
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

    describe("selecting the right action", function () {
      it("should prioritize the entries in `actions` hash of the component", function () {
        var actionFn = function () {};
        var componentFn = function () {};
        var fn = this.module.selectAction('test', { actions: {test: actionFn}, testAction: componentFn});
        fn.should.be.equal(actionFn);
      });

      it("should should fallback to a component's method named `action`Action", function () {
        var componentFn = function () {};
        var fn = this.module.selectAction('test', { actions: {}, testAction: componentFn});
        fn.should.be.equal(componentFn);
      });

      it("should delegate to a component method if the value for the existing key is a string", function () {
        var componentFn = function () {};
        var fn = this.module.selectAction('test', { actions: {test: "awesomeMethod"}, awesomeMethod: componentFn});
        fn.should.be.equal(componentFn);

        //Fallback on `action`Name key
        var fallbackFn = this.module.selectAction('test', { actions: {}, testAction: "awesomeMethod", awesomeMethod: componentFn});
        fallbackFn.should.be.equal(componentFn);
      });

      it("should throw if no method is found", function () {
        this.module.selectAction.bind(undefined, 'nonExisting', {}).should.throw();
      });
    });

    describe("getting the action data", function () {
      it('should return a camelized name without the app prefix', function () {
        this.module.formatActionData({
          hullOption1: true,
          hullOption2: true,
          vendorOption: true,
          'hull-another-option': true
        }).should.have.keys(['option1', 'option2', 'vendorOption', 'anotherOption']);
      });
    });

    describe("Triggering actions", function () {
      beforeEach(function () {
        this.fakeEvent = sinon.stub({
          currentTarget: "__target__",
          preventDefault: function () {},
          stopPropagation: function () {},
          stopImmediatePropagation: function () {}
        });
      });

      it("should not bubble and prevent propagation of the event", function () {
        this.module.actionHandler.call(this.componentMock, this.fakeEvent);
        this.fakeEvent.preventDefault.should.have.been.called;
        this.fakeEvent.stopPropagation.should.have.been.called;
        this.fakeEvent.stopImmediatePropagation.should.have.been.called;
      });

      it("should call the option formatter with the options of the element", function () {
        var fakeOptionData = {
          hullAction: fakeActionName,
          hullOption1: undefined
        };
        var fakeActionName = "test";
        var stub = sinon.stub(this.componentMock.sandbox.dom, 'find', function () {
          return {
            data: function (actionName) {
              if (actionName === "hull-action") {
                return fakeActionName;
              }
              return fakeOptionData;
            }
          };
        });
        var formatSpy = sinon.spy(this.module, 'formatActionData');
        this.module.actionHandler.call(this.componentMock, this.fakeEvent);
        formatSpy.should.have.been.called;
        formatSpy.should.have.been.calledWith(fakeOptionData);
        formatSpy.restore();
        stub.restore();
      });

      it("should call the option formatter with the options of the element", function () {
        var fakeOptionData = {
          hullAction: fakeActionName,
          hullOption1: undefined
        };
        var fakeActionName = "test";
        var stub = sinon.stub(this.componentMock.sandbox.dom, 'find', function () {
          return {
            data: function (actionName) {
              if (actionName === "hull-action") {
                return fakeActionName;
              }
              return fakeOptionData;
            }
          };
        });
        this.componentMock.actions = { test: sinon.spy() };
        var actionSelectSpy = sinon.spy(this.module, 'selectAction');
        this.module.actionHandler.call(this.componentMock, this.fakeEvent);
        actionSelectSpy.should.have.been.called;
        actionSelectSpy.should.have.been.calledWith(fakeActionName, this.componentMock);
        stub.restore();
        actionSelectSpy.restore();
      });

      it("should call the action method with the component as scope", function () {
        var fakeOptionData = {
          hullAction: fakeActionName,
          hullOption1: undefined
        };
        var fakeActionName = "test";
        var stub = sinon.stub(this.componentMock.sandbox.dom, 'find', function () {
          return {
            data: function (actionName) {
              if (actionName === "hull-action") {
                return fakeActionName;
              }
              return fakeOptionData;
            }
          };
        });
        this.componentMock.actions = { test: sinon.spy() };
        this.module.actionHandler.call(this.componentMock, this.fakeEvent);
        this.componentMock.actions.test.should.have.been.calledOnce;
        this.componentMock.actions.test.should.have.been.calledWith(this.fakeEvent);
        stub.restore();
      });

      it("should call the action method with the component as scope", function () {
        var fakeOptionData = {
          hullAction: fakeActionName,
          hullOption1: undefined
        };
        var fakeActionName = "test";
        var fakeSource = {
          data: function (actionName) {
            if (actionName === "hull-action") {
              return fakeActionName;
            }
            return fakeOptionData;
          }
        };
        var stub = sinon.stub(this.componentMock.sandbox.dom, 'find', function () {
          return fakeSource;
        });
        this.componentMock.actions = { test: sinon.spy() };
        this.module.actionHandler.call(this.componentMock, this.fakeEvent);
        var secondArg = this.componentMock.actions.test.args[0][1];
        secondArg.should.have.keys(['el', 'data']);
        secondArg.el.should.be.eql(fakeSource);
        secondArg.data.should.be.deep.equal(this.module.formatActionData(fakeOptionData));
        stub.restore();
      });
    });
  });
});
