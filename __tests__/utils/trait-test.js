jest.dontMock("../../src/client/traits");
var Trait = require("../../src/client/traits");

function makeTrait(key, value) {
  var api = jest.genMockFn();
  var trait = Trait(api)('foo', value);
  return [api, trait];
}

describe("Traits", function() {


  describe("with no initial value", function() {

    var api, trait;
    beforeEach(() => [api, trait] = makeTrait('foo'));


    it("should not call api in initialization", ()=>
      expect(api).not.toBeCalled()
    );

    describe("and an operation after", function() {


      var methods = [['inc', 1], ['set', 'yeah'], ['dec', 2]];

      methods.map(function([op, val]) {

        it("works with " + op, function() {
          trait[op](val);
          expect(api).toBeCalledWith('me/traits', 'put', {
            name: 'foo',
            operation: op,
            value: val
          });
        });

      });

    });

  });


  describe("with an initial value", function() {

    var api, trait;
    beforeEach(() => [api, trait] = makeTrait('foo', 'bar'));

    it("records the value with set on initialization", function() {
      expect(api).toBeCalledWith('me/traits', 'put', {
        name: 'foo',
        operation: 'set',
        value: 'bar'
      });
    });
  });
});
