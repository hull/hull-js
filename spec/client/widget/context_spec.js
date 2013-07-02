"use strict";
define(['lib/client/widget/context', 'jquery'], function (Context, $) {
  var promises = {
    deferred: $.Deferred,
    when: $.when
  };
  describe('Widget context builder', function () {
    it('should be a constructor', function () {
      Context.should.be.a('function');
    });
    describe('initial state', function () {
      it ('should be empty at init', function () {
        var c = new Context();
        Object.keys(c.build()).length.should.eql(0);
      });
      it ('should be null at init', function () {
        var c = new Context();
       expect(c.errors()).to.be.null;
      });
    });
    it('should be possible to add key value pairs to the context', function () {
      var c = new Context();
      c.add('test', "Awesome");
      c.build().should.have.keys(['test']);
      c.build().test.should.eql('Awesome');
    });
    describe('adding a datasource', function () {
      it('should return a promise', function () {
        var c = new Context();
        var dfd = promises.deferred();
        var ret = c.addDatasource('test', dfd.promise());
        ret.should.contain.keys(['promise', 'done', 'fail']);
      });
      it('should return a new promise', function () {
        var c = new Context();
        var dfd = promises.deferred();
        var ret = c.addDatasource('test', dfd.promise());
        ret.should.not.eql(dfd);
      });
      describe('The returned promise', function () {
        describe('succeeds', function () {
          it('should return null for its errors', function () {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            ret.then(function (v) {
              expect(c.errors()).to.be.null;
            });
            dfd.resolve(true)
          });
          it('should resolve to the same value as the datasource if it succeeds', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            var resolvedValue = {OK: "GREAT"};
            ret.then(function (v) {
              v.should.be.equal(resolvedValue);
              done();
            });
            dfd.resolve(resolvedValue);
          });
          it('should add an entry to the context', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            var resolvedValue = {OK: "GREAT"};
            ret.then(function (v) {
              c.build().should.contain.keys(['test']);
              c.build().test.should.eql(resolvedValue);
              done();
            });
            dfd.resolve(resolvedValue);
          });
        });
        describe('fails', function () {
          it('should add an entry to the errors', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            var err = new Error('FAIL!');
            ret.then(function (v) {
              c.errors().should.contain.keys(['test']);
              expect(c.errors().test).to.be.equal(err);
              done();
            });
            dfd.reject(err);
          });
          it('should add an entry to the context', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            ret.then(function (v) {
              c.build().should.contain.keys(['test']);
              expect(c.build().test).to.be.undefined;
              done();
            });
            dfd.reject(new Error('FAIL!'));
          });
          it('should resolve to undefined if no fallback is provided', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var ret = c.addDatasource('test', dfd.promise());
            ret.then(function (v) {
              expect(v).to.be.undefined;
              done();
            });
            dfd.reject(new Error('FAIL!'));
          });
          it('should call the provided fallback function', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var spy = sinon.spy();
            var ret = c.addDatasource('test', dfd.promise(), spy);
            ret.then(function (v) {
              spy.should.have.been.called;
              done();
            });
            dfd.reject(new Error('FAIL!'));
          });
          it('should store the return value of the provided fallback function as the context value', function (done) {
            var c = new Context();
            var dfd = promises.deferred();
            var fallback = {fall: 'back'};
            var spy = sinon.spy(function () {
              return fallback;
            });
            var ret = c.addDatasource('test', dfd.promise(), spy);
            ret.then(function (v) {
              c.build().test.should.be.equal(fallback)
              done();
            });
            dfd.reject(new Error('FAIL!'));
          });
        });
      });
    });
  });
});

