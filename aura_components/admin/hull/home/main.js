Hull.component({
  refreshEvents: ['model.hull.me.change'],
  templates: ['main', 'recover'],

  initialize: function () {
    this.errors = [];
    this.messages = [];
    this.sandbox.on('hull.auth.login', this.redirectIfApproved);
  },
  redirectIfApproved: function (me) {
    if (me.approved) {
      window.location.pathname = '/';
    }
  },
  actions: {
    showLogin: function () {
      this.clearMessages();
      this.wantsSignup = false;
      this.template = 'main';
      this.refresh();
    },
    showSignup: function () {
      this.clearMessages();
      this.wantsSignup = true;
      this.refresh();
    },
    doLogin: function (evt, ctx) {
      var self = this;
      this.clearMessages();
      var formData = this.getFormData();
      this.sandbox.login(formData.email, formData.password).then(
        this.redirectIfApproved,
        function (err) {
          self.errors.push(err.message);
      }).then(function () {
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
      this.clearMessages();
      var formData = this.getFormData();
      Hull.signup(formData).then(
        this.actions.doBootstrap,
        function (err) {
          self.errors.push(err.message);
          self.refresh();
      });
    },
    doBootstrap: function () {
      window.location.pathname = '/accounts/bootstrap';
    },
    toggleTemplate: function (el, ctx) {
      this.clearMessages();
      this.template = ctx.data.template || this.templates[0];
      this.refresh();
    },
    doRecoverPassword: function () {
      this.clearMessages();
      var self = this;
      var email = this.getFormData().email;
      this.api.post('users/request_password_reset', {email: email}).then(function () {
        self.messages.push('An email has been sent. Check your inbox.');
      }, function () {
        self.errors.push('This is not a valid email address');
      }).then(function () {
        self.refresh();
      });
    }
  },

  beforeRender: function (data) {
    data.wantsSignup = this.wantsSignup;
    data.errors = this.errors;
    data.messages = this.messages;
  },

  getFormData: function () {
    return  {
      email: this.$find('#email').val(),
      password: this.$find('#password').val()
    };
  },
  clearMessages: function () {
    this.messages.splice(0, this.messages.length);
    this.errors.splice(0, this.errors.length);
  }
});
