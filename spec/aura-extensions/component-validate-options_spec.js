/*global define:true, describe:true, it:true*/
define(['promises', 'underscore', 'aura-extensions/aura-component-validate-options'], function (promises, _, extension) {
  "use strict";
  var fakeApp = { core: {
    util: { _: _ },
    data: { deferred: function () { return promises.defer() } }
  } };
  var checkOptions = extension(fakeApp).checkOptions;
  describe('Required options', function () {
    it('should resolve if no required options are specified', function () {
      expect(checkOptions.call(Object.create({}), {})).to.be.true;
    });
    it('should resolve if required options are empty', function () {
      var checker = checkOptions.call({requiredOptions: []}, {});
      expect(checker).to.be.true;
    });
    it('should resolve if the required options are present', function () {
      var checker = checkOptions.call({requiredOptions: ['yep']}, {yep: true});
      expect(checker).to.be.true;
    });
    it('should reject if the required options are not present', function () {
      var checker = checkOptions.bind({requiredOptions: ['yep']}, {});
      checker.should.throw();
    });
    it('should reject if the required options are undefined', function () {
      var checker = checkOptions.bind({requiredOptions: ['yep']}, {yep: undefined});
      checker.should.throw();
    });
  });
});
