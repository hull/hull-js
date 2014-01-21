define(['lib/utils/base64'], function (base64) {
  describe('Base64 transforms', function () {
    before(function () {
      sinon.stub(base64.utils, 'unescape', function (v) { return v + '_unescape'; });
      sinon.stub(base64.utils, 'encodeURIComponent', function (v) { return v + '_encodeURIComponent'; });
      sinon.stub(base64.utils, 'btoa', function (v) { return v + '_btoa'; });
      sinon.stub(base64.utils, 'atob', function (v) { return v + '_atob'; });
      sinon.stub(base64.utils, 'escape', function (v) { return v + '_escape'; });
      sinon.stub(base64.utils, 'decodeURIComponent', function (v) { return v + '_decodeURIComponent'; });
    });
    after(function () {
      base64.utils.btoa.restore();
      base64.utils.unescape.restore();
      base64.utils.encodeURIComponent.restore();
      base64.utils.atob.restore();
      base64.utils.escape.restore();
      base64.utils.decodeURIComponent.restore();
    });

    describe('Encoding to Base64', function () {
      it('should call global methods in correct order', function () {
        base64.encode('abcd');
        base64.utils.btoa.should.have.been.called;
        base64.utils.unescape.should.have.been.called;
        base64.utils.encodeURIComponent.should.have.been.called;

        base64.utils.encodeURIComponent.should.have.been.calledBefore(base64.utils.unescape);
        base64.utils.unescape.should.have.been.calledBefore(base64.utils.btoa);
      });
      it('should return the encoded value', function () {
        base64.encode('abcd').should.be.eql('abcd_encodeURIComponent_unescape_btoa');
      });
    });
    describe('Decoding from Base64', function () {
      it('should call global methods in correct order', function () {
        base64.decode('abcd');
        base64.utils.btoa.should.have.been.called;
        base64.utils.escape.should.have.been.called;
        base64.utils.decodeURIComponent.should.have.been.called;

        base64.utils.decodeURIComponent.should.have.been.calledAfter(base64.utils.escape);
        base64.utils.escape.should.have.been.calledAfter(base64.utils.btoa);
      });
      it('should return the decoded value', function () {
        base64.decode('abcd').should.be.eql('abcd_atob_escape_decodeURIComponent');
      });
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
