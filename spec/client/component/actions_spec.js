define(['lib/client/component/actions'], function (actionModule) {
  describe("default actions", function () {
    it("should have spme defasult actions defined", function () {
      actionModule.defaultActions.should.be.a('array');
    });
  });
});
