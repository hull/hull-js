/*global define:true */
define(['lib/client/datasource', 'promises'], function (Datasource, promises) {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

  var api;

  describe("Datasources", function () {
    beforeEach(function () {
      api = sinon.spy(function () {
        return promises.defer().promise;
      });
    })
    it('Datasource should be a prototype', function () {
      Datasource.should.be.a('function');
      Datasource.prototype.should.be.a('object');
    });

    describe("Declaration", function () {
      it('should be rejected with a lsy value for tdattce definition', function () {
        var fn1 = function () { new Datasource(undefined, api); };
        var fn2 = function () { new Datasource('', api); };
        var fn3 = function () { new Datasource(null, api); };
        var fn4 = function () { new Datasource(undefined, api); };
        fn1.should.throw(TypeError);
        fn2.should.throw(TypeError);
        fn3.should.throw(TypeError);
        fn4.should.throw(TypeError);
      });

      it('should throw an error when no transport is provided', function () {
        var fn1 = function () { new Datasource('abc'); };
        fn1.should.throw(TypeError);
      });

      it('should throw an error when the transport is not a function', function () {
        var fn1 = function () { new Datasource('abc', ''); };
        var fn2 = function () { new Datasource('abc', {}); };
        var fn3 = function () { new Datasource('abc', function () {}); };
        fn1.should.throw(TypeError);
        fn2.should.not.throw();
        fn3.should.not.throw(TypeError);
      });

      describe("With a string", function () {
        it("should be allowed with a non-empty string", function () {
          var ds = new Datasource('1234', api);
          ds.def.should.have.keys(['path', 'provider', 'params']);
        });

        it("should use 'hull' as a provider", function () {
          var ds = new Datasource('1234', api);
          ds.def.provider.should.eql('hull');
        });

      });

      describe("With an object", function () {
        it("should contain a 'path' property", function () {
          var fn1 = function () {
            var ds = new Datasource({type: 'myType'}, api);
          };
          fn1.should.throw(TypeError);

          var fn2 = function () {
            var ds = new Datasource({type: 'myType', path: 'myPath'}, api);
          };
          fn2.should.not.throw();
        });

        it("should default to 'hull' as a provider", function () {
          var ds1 = new Datasource({path: 'abcd'}, api);
          ds1.def.provider.should.eql('hull');
          var ds2 = new Datasource({path: 'abcd', provider: 'myProvider'}, api);
          ds2.def.provider.should.eql('myProvider');
        });
      });

      describe("With a function", function () {
        it("should use the function as the definition", function () {
          var noop = function () {};
          var ds = new Datasource(noop, api);
          ds.def.should.eql(noop);
        });
      });
    });

    describe('Placeholders in URIs', function () {
      it('should be replaced when calling Datasource::parse', function () {
        var ds = new Datasource(':abc:def', api);
        ds.parse({abc: 'Hull', def: '.io'});
        ds.def.path.should.eql('Hull.io');
      });

      it('should raise an exception when a placeholder can\'t be replaced', function () {
        var ds = new Datasource(':abc:def', api);
        ds.parse.bind(ds, {abc: 'Hull', de: '.io'}).should.throw(Error);
        ds.parse.bind(ds, {abc: 'Hull', de: '.io'}).should.throw('Cannot resolve datasource binding :def');
      });
    });

    describe('definition path', function() {
      it('removes query string', function() {
        var path = new Datasource('foo?bar=baz', api).def.path;
        path.should.equal('foo');
      });
    });

    describe('definition params', function() {
      it('parses query string from path', function() {
        var params = new Datasource('foo/bar?bar=baz&baz=qux', api).def.params;
        params.should.eql({
          bar: 'baz',
          baz: 'qux'
        });
      });

      it('extends params with query string', function() {
        var params = new Datasource({
          path: 'hello?foo=bar',
          params: { bar: 'baz' }
        }, api).def.params;

        params.should.eql({ foo: 'bar', bar: 'baz' });
      });

      it('params has precedence over query string', function() {
        var params = new Datasource({
          path: 'hello?foo=bar',
          params: { foo: 'baz' }
        }, api).def.params;

        params.should.eql({ foo: 'baz' });
      });
    });

    describe("Requesting", function () {
      it('should use the transport to fetch data', function () {
        var ds = new Datasource('hop', api);
        ds.fetch();
        api.should.have.been.called;
      });
      it('should require a complete response', function () {
        var ds = new Datasource('hop', api);
        ds.fetch();
        api.should.have.been.calledOnce;
        var args = api.args[0];
        args[0].should.contain.key('completeResponse');
        args[0].completeResponse.should.eql(true);
      });
    });
  });
});
