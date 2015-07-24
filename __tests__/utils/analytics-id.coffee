jest
  .dontMock "../../src/utils/analytics-id"
  .dontMock "../../src/utils/uuid"
  .dontMock "../../src/utils/cookies"
  .dontMock "cookies-js"

describe "analyticsJS IDs", ()->
  analyticsId = require "../../src/utils/analytics-id"
  it "Returns the same browser ID when called twice", ()->
    browserId1 = analyticsId.getBrowserId()
    browserId2 = analyticsId.getBrowserId()
    expect(browserId1).toBe browserId2

  it "Returns the same session ID when called twice", ()->
    browserId1 = analyticsId.getSessionId()
    browserId2 = analyticsId.getSessionId()
    expect(browserId1).toBe browserId2
