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
        config.fake.should.contain.keys('credentials');
        config.fake.credentials.should.eql(tokens.fake);
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
        other: ['mp', 'np_stuff']
      };
      this.normalizer.sortServicesByType(settings, types).should.eql({
        auth: {
          fb: {},
          abc: {}
        },
        other: {
          mp: {},
          np: {}
        }
      });
    });
    it('should handle empty auth config with email credentials', function () {
      var testConfig = { ex: 'value' };
      this.normalizer.config = {
        settings: {},
        data: {
          credentials: {
            hull: testConfig
          }
        },
        services: {
          settings: {},
          types: {}
        }
      };
      this.normalizer.normalize();
      this.normalizer.config.settings.should.contain.key('auth');
      this.normalizer.config.settings.auth.should.contain.key('hull');
      this.normalizer.config.settings.auth.hull.should.be.eql({ credentials: testConfig });
    });
  });
});
