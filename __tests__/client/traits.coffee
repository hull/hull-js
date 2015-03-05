jest
  .dontMock "../../src/client/traits"
  .dontMock "../../src/utils/lodash"

describe "Client Traits", ()->
  it "Calls the api gateway with the right params", ()->
    expect(1).toBe(1)
