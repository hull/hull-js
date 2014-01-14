define(['lib/utils/config', 'underscore'], function (config, _) {
  describe('safe config interface module', function () {
    it('should expose a function', function () {
      config.should.be.a('function');
    });
    it('should return a function when executed', function () {
      config().should.be.a('function');
    });
  });

  describe('sage config getter', function () {
    before(function () {
      this.testConfig = { a: "test", b: { c: "nested" } }
      this.configGetter = config(this.testConfig);
    });
    it('should return a clone of the initial config object', function () {
      this.configGetter().should.eql(this.testConfig);
      this.configGetter().should.not.equal(this.testConfig);
    });
    it('should give accesss to a path in the config', function () {
      this.configGetter('a').should.eql(this.testConfig.a);
      this.configGetter('b.c').should.eql(this.testConfig.b.c);
    });
    it("should return undefined when the given key doesn't exist", function () {
      expect(this.configGetter('x.y.z')).to.be.undefined;
    });
  });
});
