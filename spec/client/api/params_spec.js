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

    xit("must have a string as the first parameter", function () {
      var params = [123, null, undefined, Object.create(null), {}];
      params.forEach(function (param) {
        apiParams.bind(api, param).should.throw(TypeError);
      });
    });

  });
});
