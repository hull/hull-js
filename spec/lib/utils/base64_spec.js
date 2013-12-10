define(['lib/utils/base64'], function (base64) {
  describe('Base64 transforms', function () {
    describe('Encoding to Base64', function () {
      beforeEach(function () {
        this.unescapeStub       = sinon.stub(window, 'unescape', function (v) { return v + '_unescape'; });
        this.encodeURIComponent = sinon.stub(window, 'encodeURIComponent', function (v) { return v + '_encodeURIComponent'; });
        this.btoaStub           = sinon.stub(window, 'btoa', function (v) { return v + '_btoa'; });
      });
      afterEach(function () {
        this.unescapeStub.restore();
        this.encodeURIComponent.restore();
        this.btoaStub.restore();
      });

      it('should call global methods in correct order', function () {
        base64.encode('abcd');
        this.btoaStub.should.have.been.called;
        this.unescapeStub.should.have.been.called;
        this.encodeURIComponent.should.have.been.called;

        this.encodeURIComponent.should.have.been.calledBefore(this.unescapeStub);
        this.unescapeStub.should.have.been.calledBefore(this.btoaStub);
      });
      it('should return the encoded value', function () {
        base64.encode('abcd').should.be.eql('abcd_encodeURIComponent_unescape_btoa');
      });
    });
    describe('Decoding from Base64', function () {
      beforeEach(function () {
        this.atobStub           = sinon.stub(window, 'atob', function (v) { return v + '_btoa'; });
        this.escapeStub         = sinon.stub(window, 'escape', function (v) { return v + '_escape'; });
        this.decodeURIComponent = sinon.stub(window, 'decodeURIComponent', function (v) { return v + '_decodeURIComponent'; });
      });
      afterEach(function () {
        this.atobStub.restore();
        this.escapeStub.restore();
        this.decodeURIComponent.restore();
      });

      it('should call global methods in correct order', function () {
        base64.decode('abcd');
        this.btoaStub.should.have.been.called;
        this.escapeStub.should.have.been.called;
        this.decodeURIComponent.should.have.been.called;

        this.decodeURIComponent.should.have.been.calledAfter(this.escapeStub);
        this.escapeStub.should.have.been.calledAfter(this.btoaStub);
      });
      it('should return the decoded value', function () {
        base64.decode('abcd').should.be.eql('abcd_btoa_escape_decodeURIComponent');
      });
    });
    describe('Encoding and decoding are inverse functions', function () {
      it('encode and decode are reversible', function () {
        base64.decode(base64.encode('abcd')).should.be.eql('abcd');
      });
      it('should accept Unicode characters', function () {
        base64.decode(base64.encode('✔')).should.be.eql('✔');
      });
    });
  });
});
