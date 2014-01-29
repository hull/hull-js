define(['lib/remote/config-normalizer'], function (CfgNorm) {
  describe('Config Normalizer', function () {
    beforeEach(function () {
      this.config = {}
      this.normalizer = new CfgNorm(this.config);
    });

    describe('user credentials', function () {
      it('should not apply credentials if no properties are provided', function () {
        var config = {};
        this.normalizer.applyUserCredentials(config, {'fake': {}});
        config.should.not.contain.keys('fake');
      });
      it('should not apply credentials if none is provided', function () {
        var config = { fake: {}};
        this.normalizer.applyUserCredentials(config, {});
        config.fake.should.not.contain.keys('token');
      });
      it('should apply credentials if provided', function () {
        var config = { fake: {}};
        var tokens = { fake: {a: true}};
        this.normalizer.applyUserCredentials(config, tokens);
        config.fake.should.contain.keys('tokens');
        config.fake.tokens.should.eql(tokens.fake);
      });
    });

    it ('should sort service config', function () {
      var settings = {
        fb_app: {},
        mp: {},
        abc: {}
      };
      var types = {
        auth: ['fb_app', 'abc'],
        other: ['mp']
      };
      this.normalizer.sortServicesByType(settings, types).should.eql({
        auth: {
          fb: {},
          abc: {}
        },
        other: {
          mp: {}
        }
      });
    });
  });
});
