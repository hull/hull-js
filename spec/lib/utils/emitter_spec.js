define(['lib/utils/emitter'], function (ee) {
  describe('eventEmitter helper', function () {
    it('should have a limited set of the EventEmitter methods', function () {
      ee().should.have.keys('on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners');
    });
    it('should create a new instance of EventEmitter at every call', function () {
      ee().should.not.eql(ee());
    });
  });
});
