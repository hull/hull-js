Hull.component({

  templates: ['form'],
  refreshEvents: ['model.hull.me.change'],
  events: {
    'keyup input': function() {
      this.alertMessage(false);
    },
    'submit .form-signin': function(e) {
      e.preventDefault();
      this.alertMessage(false);
      var signinData = this.sandbox.dom.getFormData(e.target);
      this.sandbox.login(signinData.login, signinData.password);
    },

    'submit .form-validations': function(e) {
      e.preventDefault();
      var self = this;
      var signinData = this.sandbox.dom.getFormData(e.target);
      this.api('me', signinData, 'put').then(function() {
        self.render();
      }, function(err) {
        self.alertMessage(err.message);
      });
    }
  },

  actions: {
    resetPassword: function() {
      var $inputLogin = this.$('[data-hull-input-login]');
      var email = $inputLogin.val();
      this.requestEmail(email, 'request_password_reset');
    },
    resendConfirmation: function() {
      var email;
      if (Hull.currentUser()) {
        email = Hull.currentUser().email;
      } else {
        email = $inputLogin.val();
      }
      this.requestEmail(email, 'request_confirmation_email');
    }
  },

  datasources: {
    validationStatus: function() {
      return this.loggedIn() && this.api('me/validation_status');
    },
    currentUser: 'me'
  },

  initialize: function() {
    this.sandbox.on('hull.auth.fail', function(err) {
      this.alertMessage(err.message || err.reason);
    }, this);
  },

  requestEmail: function(email, type) {
    var self = this;
    if (/^\S+@\S+\.\S+$/i.test(email)) {
      this.api('users/' + type, 'post', { email: email }).then(function(res) {
        self.alertMessage("Email sent to " + email + ". Check your inbox !");
      }, function(err) {
        if (err.status == 429 && err.retry_after) {
          var minutes = Math.round(err.retry_after / 60);
          self.alertMessage("An email has already been sent to " + email + ". Please check your inbox. You will be able to retry in " + minutes + " minutes ("  + err.retry_after + " seconds)");
        }
      });
    } else {
      this.alertMessage("You must provide a valid email: " + email);
    }
  },

  beforeRender: function(data) {
    if (data.validationStatus && !data.validationStatus.valid && data.validationStatus.validations) {
      data.validationErrors = {};
      for (var key in data.validationStatus.validations) {
        if (!data.validationStatus.validations[key]) {
          data.validationErrors[key] = true;
        }
      }
    }
  },

  alertMessage: function(message) {
    var $alertMsg = this.$("[data-hull-alert-message]");
    if (message) {
      $alertMsg.html(message);
      $alertMsg.show();
    } else {
      $alertMsg.hide();
    }
  }
});
