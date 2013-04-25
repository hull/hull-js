define(['lib/client/api/params'], function (apiParams) {

  describe('Normalizing the parameters to API method calls', function () {
    it('should only accept an array as its only parameter', function () {
      apiParams.parse.bind(undefined, 'aa').should.throw(TypeError);
    });
    describe('Defining the URI', function () {
      it('should be possible with a non-empty string', function () {
        apiParams.parse.bind(undefined, ['anything']).should.not.throw;
        apiParams.parse.bind(undefined, ['']).should.throw;
      });
      it('should be possible with an object that contains a non-empty `path` property', function () {
        apiParams.parse.bind(undefined, [{path: 'anything'}]).should.not.throw;
        apiParams.parse.bind(undefined, [{path: ''}]).should.throw;
        apiParams.parse.bind(undefined, [{}]).should.throw;
      });
    });

    describe('Defining the provider', function () {
      it('should be possible to specify the provider with an object that contains a non-empty `provider` attribute', function () {
        apiParams.parse([{path: 'abc', provider: 'prov'}])[0].path.should.equal('prov/abc');
      });
      it('defaults to `hull`', function () {
        apiParams.parse(['abc'])[0].path.should.equal('hull/abc');
        apiParams.parse([{path: 'abc', provider: ''}])[0].path.should.equal('hull/abc');
        apiParams.parse([{path: 'abc'}])[0].path.should.equal('hull/abc');
      });
    });

    describe('Adding parameters to the request ', function () {
      it('should be done by passing Object arguments to the array', function () {
        apiParams.parse(['abc', {a:'a'}])[0].params.should.eql({a: 'a'});
        apiParams.parse(['abc', {a:'a'}, {b: 'b'}])[0].params.should.eql({a: 'a', b: 'b'});
        apiParams.parse(['abc', {a:'a'}, {b: 'b', a: 'A'}])[0].params.should.eql({a: 'A', b: 'b'});
      });
      it('should be possible to pass a `params` key to the description object', function () {
        apiParams.parse([{path: 'abc', params: {a:'a'}}])[0].params.should.eql({a: 'a'});
        apiParams.parse([{path: 'abc', params: {a:'a'}}, {b: 'b'}])[0].params.should.eql({a: 'a', b: 'b'});
        apiParams.parse([{path: 'abc', params: {a:'a'}}, {a: 'A', b: 'b'}])[0].params.should.eql({a: 'A', b: 'b'});
      });
      it('should extend the parameters from left to right arguments', function () {
        apiParams.parse(['bla', {a:'a'}, {b:'b', c:'c'}, {a:'A'}])[0].params.should.eql({a:'A', b: 'b', c: 'c'})
      });
    });

    describe('Defining the HTTP Method', function () {
      it('should default to `GET`', function () {
        apiParams.parse(['abc'])[0].method.should.equal('get');
        apiParams.parse([{path:'abc'}])[0].method.should.equal('get');
      });
      it('should be possible to specify by passing a String argument', function () {
        apiParams.parse(['abc', 'put'])[0].method.should.equal('put');
      });
      it('should reject any more String parameters', function () {
        apiParams.parse.bind(undefined, ['abc', 'put', 'test']).should.throw;
      });
    });

    describe('Callbacks', function () {
      it('should be defined ny passing functions in the array', function () {
        var cb = function () {};
        var errb = function () {};
        apiParams.parse(['abc', cb])[1].should.equal(cb);
        apiParams.parse(['abc', cb, errb])[1].should.equal(cb);
        apiParams.parse(['abc', cb, errb])[2].should.equal(errb);
      });

      it('should reject more than 2 functions in the arguments', function () {
        var cb = function () {};
        var errb = function () {};
        var nope = function () {};
        apiParams.parse.bind(undefined, ['abc', cb, errb, nope]).should.throw;
      });
    });

    xit("must have a string as the first parameter", function () {
      var params = [123, null, undefined, Object.create(null), {}];
      params.forEach(function (param) {
        apiParams.bind(api, param).should.throw(TypeError);
      });
    });

  });
});
