Hull.component({
  refreshEvents: ['model.hull.me.change'],
  templates: ['main'],

  initialize: function () {
    this.errors = [];
    this.sandbox.on('hull.auth.login', function (me) {
      if (me.approved) {
        window.location.pathname = '/';
      }
    });
  },
  actions: {
    showLogin: function () {
      this.clearErrors();
      this.wantsSignup = false;
      this.refresh();
    },
    showSignup: function () {
      this.clearErrors();
      this.wantsSignup = true;
      this.refresh();
    },
    doLogin: function (evt, ctx) {
      var self = this;
      this.clearErrors();
      var formData = this.getFormData();
      this.sandbox.login(formData.email, formData.password).then(function (me) {
        if (me.approved) {
          window.location.pathname = '/';
        } else {
          self.refresh();
        }
      }, function (err) {
        self.errors.push(err.message);
        self.refresh();
      });
    },
    logoutAndShowLogin: function () {
      var self = this;
      this.sandbox.logout().then(function () {
        self.actions.showLogin.apply(self);
      });
    },
    doSignup: function (evt, ctx) {
      var self = this;
      this.clearErrors();
      var formData = this.getFormData();
      Hull.signup(formData).then(function (me) {
        window.location.pathname = '/accounts/bootstrap';
      }, function (err) {
        self.errors.push(err.message);
        self.refresh();
      });
    },
    doBootstrap: function () {
      window.location.pathname = '/accounts/bootstrap';
    }
  },

  beforeRender: function (data) {
    data.wantsSignup = this.wantsSignup;
    data.errors = this.errors;
  },

  getFormData: function () {
    return  {
      email: this.$find('#email').val(),
      password: this.$find('#password').val()
    };
  },
  clearErrors: function () {
    this.errors.splice(0, this.errors.length);
  }
});
