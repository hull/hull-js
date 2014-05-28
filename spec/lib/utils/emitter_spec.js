define(['lib/utils/emitter'], function (ee) {
  describe('eventEmitter helper', function () {
    it('should have a limited set of the EventEmitter methods', function () {
      ee().should.have.keys('on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners');
    });
    it('should create a new instance of EventEmitter at every call', function () {
      ee().should.not.eql(ee());
    });

    describe('EventEmitter#on context', function () {
      it('should give all arguments to the listener, plus a context', function (done) {
        var _ee = ee();
        _ee.on('test', function () {
          arguments.length.should.eql(3);
          arguments[0].should.eql(0);
          arguments[1].should.eql('abc');
          arguments[2].eventName.should.eql('test');
          arguments[2].should.contain.key('stack');
          done();
        });
        _ee.emit('test', 0, 'abc');
      });
      it('should give the event name and a stack trace as the context', function (done) {
        var _ee = ee();
        _ee.on('test', function () {
          var lastArg = arguments[arguments.length - 1];
          lastArg.should.be.an('object');
          lastArg.should.have.keys('eventName', 'stack');
          lastArg.eventName.should.eql('test');
          lastArg.stack.should.be.a('string');
          done();
        });
        _ee.emit('test');
      });
      it('should give full event name', function (done) {
        var _ee = ee();
        _ee.on('test.*', function () {
          var lastArg = arguments[arguments.length - 1];
          lastArg.eventName.should.eql('test.awesome');
          done();
        });
        _ee.emit('test.awesome');
      });
    })
  });
});
