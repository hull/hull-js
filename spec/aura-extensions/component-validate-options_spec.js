/*global define:true, describe:true, it:true*/
define(['promises', 'underscore', 'aura-extensions/aura-component-validate-options'], function (promises, _, extension) {
  "use strict";
  var fakeApp = { core: {
    util: { _: _ },
    data: { deferred: function () { return promises.defer() } }
  } };
  var checkOptions = extension(fakeApp).checkOptions;
  describe('Required options', function () {
    it('should resolve if no required options are specified', function (done) {
      var promise = checkOptions.call(Object.create(null), {});
      promise.then(function () {
        done();
      }, function () {
        done('should not have been rejected');
      });
    });
    it('should resolve if required options are empty', function (done) {
      var promise = checkOptions.call({requiredOptions: []}, {});
      promise.then(function () {
        done();
      }, function () {
        done('should not have been rejected');
      });
    });
    it('should resolve if the required options are present', function (done) {
      var promise = checkOptions.call({requiredOptions: ['yep']}, {yep: true});
      promise.then(function () {
        done();
      }, function () {
        done('should not have been rejected');
      });
    });
    it('should reject if the required options are not present', function (done) {
      var promise = checkOptions.call({requiredOptions: ['yep']}, {});
      promise.then(function () {
        done('should not have been rejected');
      }, function () {
        done();
      });
    });
    it('should reject if the required options are undefined', function (done) {
      var promise = checkOptions.call({requiredOptions: ['yep']}, {yep: undefined});
      promise.then(function () {
        done('should not have been rejected');
      }, function () {
        done();
      });
    });
  });
});
