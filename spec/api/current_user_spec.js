define(['lib/api/current-user'], function (currentUserFn) {
  describe('Logging in, out and updating the current user', function () {
    beforeEach(function () {
      this.femit = {
        emit: sinon.spy(),
        on: sinon.spy()
      };
      this.userFn = currentUserFn(this.femit);
    });

    it('should return a function', function () {
      this.userFn.should.be.a('function');
    });
    it('should by default return an empty currentUser', function () {
      expect(this.userFn()).to.be.false;
    });

    it('should add listeners to hull events', function () {
      this.femit.on.should.have.been.calledWith('hull.init');
      this.femit.on.should.have.been.calledWith('hull.auth.login');
      this.femit.on.should.have.been.calledWith('hull.auth.logout');
      this.femit.on.should.have.been.calledWith('hull.auth.update');
    });

    describe('Listening to changes', function () {
      beforeEach(function () {
        var self = this;
        this.femit.on.args.forEach(function (args) {
          if (args[0].match('init')) {
            self.initListener = sinon.spy(args[1]);
          }
          if (args[0].match('login')) {
            self.loginListener = sinon.spy(args[1]);
          }
          if (args[0].match('logout')) {
            self.logoutListener = sinon.spy(args[1]);
          }
          if (args[0].match('update')) {
            self.updateListener = sinon.spy(args[1]);
          }
        });
      });

      it('should update the currentUser value on `hull.init`', function () {
        var fake = {};
        this.initListener(null, fake, null, null);
        this.userFn().should.be.eql(fake);
      });

      it('should update the currentUser value on `hull.login`', function () {
        var fake = {};
        this.loginListener(fake);
        this.userFn().should.be.eql(fake);
      });

      it('should delete the currentUser value on `hull.login`', function () {
        this.logoutListener();
        expect(this.userFn()).to.be.false;
      });

      describe('Updating the user', function () {
        describe('When there is no current User', function () {
          it('should not change if the update has no id', function () {
            this.updateListener({});
            expect(this.userFn()).to.be.false;
          });
          it('should not delegate to login if the update has id', function () {
            var user = { id: 'yop' };
            this.updateListener(user);
            this.femit.emit.should.not.have.been.calledWith('hull.auth.login', user);
          });
        });
        describe('when there is a current user', function () {
          beforeEach(function () {
            this.user = {id: 'yop'};
            this.initListener(null, this.user);
          });

          it('should update if the two have the same id', function () {
            var newUser = {id: 'yop', name: 'yipyop'};
            this.updateListener(newUser);
            this.userFn().should.be.eql(newUser);
            // this.femit.emit.should.not.have.been.calledWith('hull.auth.login');
            this.femit.emit.should.not.have.been.calledWith('hull.auth.logout');
          });

          it('should login if the two have different ids', function () {
            var newUser = {id: 'yip', name: 'yipyop'};
            this.updateListener(newUser);
            this.femit.emit.should.have.been.calledWith('hull.auth.login', newUser);
          });

          it('should logout if the new has no id', function () {
            var newUser = {name: 'yipyop'};
            this.updateListener(newUser);
            this.femit.emit.should.have.been.calledWith('hull.auth.logout');
          });
        });
      });
    });
  });
});
