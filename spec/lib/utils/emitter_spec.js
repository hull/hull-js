define(['eventemitter', 'lib/utils/emitter'], function (EventEmitter, ee) {
  describe('eventEmitter helper', function () {
    it('should have a limited set of the EventEmitter methods', function () {
      ee.should.have.keys('on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners');
    });
  });
});
