define(['lib/remote/handler', 'jquery'], function(Handler, $) {
  describe('Handler', function() {
    describe('#handle', function() {
      var handler = new Handler();

      var clock, xhr, requests;

      beforeEach(function() {
        clock = sinon.useFakeTimers();

        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];

        xhr.onCreate = function(xhr) {
          requests.push(xhr);
        }
      });

      afterEach(function() {
        clock.restore();

        xhr.restore()
        requests = [];
      });

      describe('when there is one request', function() {
        describe('when the request succeed', function() {
          it('returns a promise and resolve it', function(done) {
            var p = handler.handle({ type: 'get', url: '/api/v1/me' });

            clock.tick(100);

            requests.should.have.length(1);
            requests[0].url.should.be.equal('/api/v1/me');
            requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');

            p.done(function() {
              done();
            });
          });
        });

        describe('when the request failed', function() {
          it('returns a promise and reject it', function(done) {
            var p = handler.handle({ type: 'get', url: '/api/v1/me' });

            clock.tick(100);

            requests.should.have.length(1);
            requests[0].url.should.be.equal('/api/v1/me');
            requests[0].respond(400, { 'Content-Type': 'application/json' }, '{}');

            p.fail(function() {
              done();
            });
          });
        });
      });

      describe('when there is multiple requests', function() {
        it('calls batch api and resolve promises one by one', function(done) {
          var p1 = handler.handle({ type: 'get', url: '/api/v1/me' });
          var p2 = handler.handle({ type: 'put', url: '/api/v1/me', params: { name: 'hullio' } });
          var p3 = handler.handle({ type: 'get', url: '/api/v1/asldasldjas' });

          clock.tick(100);

          requests.should.have.length(1);
          requests[0].url.should.be.equal('/api/v1/batch');

          var r = {
            results: [
              { status: 200, body: { name: 'Julio' }, headers: {} },
              { status: 200, body: { name: 'hullio' }, headers: { 'Hull-Track': 'track' } },
              { status: 400, body: { status: 400, message: 'ooops' }, headers: {} }
            ]
          }
          requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(r));

          var h = JSON.parse(requests[0].requestBody);

          h.sequential.should.be.true;
          h.ops.should.have.length(3);

          p1.done(function(h) {
            h.response.name.should.equal('Julio');
          });

          p2.done(function(h) {
            h.response.name.should.equal('hullio');
            h.headers['Hull-Track'].should.equal('track');
          })

          p3.fail(function(h) {
            h.response.status.should.equal(400)
            h.response.message.should.equal('ooops')
          })

          $.when(p1, p2, p3).always(function() {
            done();
          });
        });

        describe('when the number of requests is to damn high', function() {
          it('sends multiple batches', function() {
            for (var i = 0; i < 60; i++) {
              handler.handle({ type: 'get', url: '/api/v1/me' });
            }

            clock.tick(100);

            requests.should.have.length(2);

            var b1 = JSON.parse(requests[0].requestBody).ops;
            var b2 = JSON.parse(requests[1].requestBody).ops;

            b1.should.have.length(50);
            b2.should.have.length(10);
          });
        });
      });
    });
  });
});
