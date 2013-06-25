"use strict";
define(['lib/client/widget/context'], function (Context) {
  describe('Widget context builder', function () {
    it('should be a constructor', function () {
      Context.should.be.a('function');
    });
    it('should be possible to add key value pairs to the context', function () {
      var c = new Context();
      c.add('test', "Awesome");
      c._context.should.have.keys(['test']);
      c._context.test.should.eql('Awesome');
    });
  });
});

