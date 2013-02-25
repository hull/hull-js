/*global define:true */
define(['aura/aura'], function (aura) {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

  describe("Datasources", function () {
    var env, Datasource, app = aura({
      appId: "fakeId",
      orgUrl: "orgUrl"
    });

    var extension = {
      initialize: function (appEnv) {
        env = appEnv;
      }
    };

    app
      .use(extension)
      .use('lib/client/datasource');

    var initStatus = app.start();
    before(function (done) {
      initStatus.then(function () {
        done();
      });
    });
    
    it('should be available in the environment', function () {
      env.core.should.contain.key('datasource');
      Datasource = env.core.datasource;
      Datasource.should.be.a('function');
    });

    describe("Declaration", function () {
      it('should be rejected with falsy values', function () {
        var fn1 = function () { new Datasource(); };
        var fn2 = function () { new Datasource(''); };
        var fn3 = function () { new Datasource(null); };
        var fn4 = function () { new Datasource(undefined); };
        fn1.should.throw(TypeError);
        fn2.should.throw(TypeError);
        fn3.should.throw(TypeError);
        fn4.should.throw(TypeError);
      });
      
      describe("With a string", function () {
        it("should be allowed with a non-empty string", function () {
          var ds = new Datasource('1234');
          ds.def.should.have.keys(['path', 'provider', 'type']);
        });

        it("should use 'hull' as a provider", function () {
          var ds = new Datasource('1234');
          ds.def.provider.should.eql('hull');
        });
      });

      describe("With an object", function () {
        it("should contain a 'path' property", function () {
          var fn1 = function () {
            var ds = new Datasource({type: 'myType'});
          };
          fn1.should.throw(TypeError);

          var fn2 = function () {
            var ds = new Datasource({type: 'myType', path: 'myPath'});
          };
          fn2.should.not.throw();
        });

        it("should default to 'hull' as a provider", function () {
          var ds1 = new Datasource({path: 'abcd'});
          ds1.def.provider.should.eql('hull');
          var ds2 = new Datasource({path: 'abcd', provider: 'myProvider'});
          ds2.def.provider.should.eql('myProvider');
        });
      });

      describe("With a function", function () {
        it("should use the function as the definition", function () {
          var noop = function () {};
          var ds = new Datasource(noop);
          ds.def.should.eql(noop);
        });
      });
    });

    describe('Placeholders in URIs', function () {
      it('should be replaced when calling Datasource::parse', function () {
        var ds = new Datasource(':abc:def');
        ds.parse({abc: 'Hull', def: '.io'});
        ds.def.path.should.eql('Hull.io');
      });

      it('should raise an exception when a placeholder can\'t be replaced', function () {
        var ds = new Datasource(':abc:def');
        ds.parse.bind(ds, {abc: 'Hull', de: '.io'}).should.throw(Error);
        ds.parse.bind(ds, {abc: 'Hull', de: '.io'}).should.throw('Cannot resolve datasource binding :def');
      });
    });
  });
});

