define(['squire', 'promises'], function (Squire, promises) {
  var injector = new Squire();
  injector.mock({
    flavour: {
      condition: function () { return promises.defer().promise; },
      success: sinon.spy(),
      failure: sinon.spy()
    },
    'lib/utils/version': "testing"
  }).require(['lib/bootstrap'], function () {

    describe('Available methods at startup', function () {

      it('should have a Hull global', function () {
        expect(window).to.contain.keys('Hull');
      });
      it('should provide some basic features', function () {
        var methods = ['on', 'track', 'init'];
        Hull.should.have.keys(methods.concat('version'));
        methods.forEach(function (m) {
          Hull[m].should.be.a('function');
        });
      });
    });
    describe('Pooled methods', function () {
      it('should throw if Hull.init is called more than once', function () {
        Hull.init({});
        Hull.init.bind(undefined, {}).should.throw();
      });
    });
  });
});
