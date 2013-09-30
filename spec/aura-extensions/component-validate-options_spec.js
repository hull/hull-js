/*global define:true, describe:true, it:true*/
define(['aura-extensions/component-validate-options'], function (extension) {
  "use strict";
  var checkOptions = extension.checkOptions;
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
  });
});
