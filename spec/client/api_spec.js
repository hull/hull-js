/*global define:true */
define(['spec/support/spec_helper', 'aura/aura', 'components/underscore/underscore'], function (helper, aura) {

  "use strict";
  /*jshint devel: true, browser: true */
  /*global describe:true, it:true, before: true, sinon: true, define: true */

  xdescribe('Models', function () {
    it("should be provided an id", function () {
      api.model.bind(api, 'anId').should.not.throw(Error);
      api.model.bind(api, {_id: 'anId'}).should.not.throw(Error);
      api.model.bind(api, {}).should.throw(Error);
    });

    it("should not be fetched", function () {
      var model = api.model(_.uniqueId());
      model._fetched.should.be.false;
    });
    it("should not provide an attached deferred to the model", function () {
      var model = api.model(_.uniqueId());
      expect(model.deferred).to.be.undefined;
    });

    it("should trigger the `sync` event when the model has been fetched", function (done) {
      var model = api.model(_.uniqueId());
      model.on('error', function (m) {
        m.should.be.equal(model);
        done();
      });
      model.on('sync', function (m) {
        m.should.be.equal(model);
        done();
      });
    });
  });
});

