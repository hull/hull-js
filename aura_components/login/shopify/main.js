Hull.component({
  templates: ['default'],

  refreshEvents: ['model.hull.me.change'],

  linkTagInjected: false,

  defaultMessages: {
    signInMessage: 'Sign In with {{provider}}',
    linkMessage: 'Link your {{provider}} account',
    unlinkMessage: 'Unlink your {{provider}} account',
    identityTakenMessage: 'This "{{provider}}" account is already linked to another User.',
    emailTakenMessage: '"{{email}}" is already taken.',
    authFailedMessage: 'You did not fully authorize or "{{provider}}" app is not well configured.',
    windowClosedMessage: 'Authorization window has been closed.',
    customerExistsMessage: '"{{email}}" is already associated with an account... Please <a href="/account/login">log in with your password</a>. If you have forgotten your password, you can <a href="/account/login#recover">reset your password here</a>.',
    disabledCustomerMessage: 'An email has been sent to {{email}}, please click the link included to verify your email address.',
    fallbackMessage: 'Bummer, something went wrong during authentication.'
  },

  actionMessages: ['signInMessage', 'linkMessage', 'unlinkMessage'],

  initialize: function() {
    this.isLoading = false;

    this.sandbox.on('hull.shopify.loading.start', this.startLoading, this);
    this.sandbox.on('hull.shopify.loading.stop', this.stopLoading, this);

    this.injectLinkTag();
  },

  beforeRender: function(data) {
    var _ = this.sandbox.util._;

    data.classes = this.getClasses();

    var l = this.loggedIn();
    data.providers = _.reduce(this.authServices(), function(m, p) {
      m[p] = {
        linked: !!l[p],
        messages: this.getProviderMessages(p),
        isUnlinkable: l && data.me.main_identity !== p
      };

      return m;
    }, {}, this);

    data.showLinkIdentity = this.options.showLinkIdentity !== false;
    data.showSignOut = this.options.showSignOut !== false;
    data.showLoader = this.options.showLoader !== false;
  },

  afterRender: function() {
    this.$errorContainer = this.$('.hull-error-container');
  },

  actions: {
    _login: function(event, action) {
      var p = this.callAndStartLoading('login', action.data.provider);

      if (this.options.redirectOnLogin !== false) {
        var location = this.options.redirectTo || '/account';
        p.done(function() { document.location = location; });
      }
    },

    _logout: function(event, action) {
      this.callAndStartLoading('logout', action.data.provider);
    },

    _linkIdentity: function(event, action) {
      this.callAndStartLoading('linkIdentity', action.data.provider, true);
    },

    _unlinkIdentity: function(event, action) {
      this.callAndStartLoading('unlinkIdentity', action.data.provider, true);
    }
  },

  callAndStartLoading: function(methodName, provider, handleSuccess) {
    this.$errorContainer.html('');

    this.startLoading();

    this.$el.addClass('hull-' + methodName);

    var self = this;

    var e = {
      provider: provider,
      redirect_url: document.location.origin + '/a/hull-callback'
    };

    if (this.options.redirectTo) {
      e.redirect_url += "?redirect_url=" + this.options.redirectTo;
    }


    if (this.options.strategy) {
      e.strategy = this.options.strategy;
    } else {
      if (this.sandbox.util.isMobile()) {
        e.strategy = 'redirect';
      }
    }

    var p = this.sandbox[methodName](e);

    p.then(function() {
      if (handleSuccess) { self.stopLoading(); }
    }, function(error) {
      var _ = self.sandbox.util._;

      var t = _.string.camelize(error.reason + '_message');
      t = self.defaultMessages[t] ? t : 'fallbackMessage';
      var message = self.compileMessage(t, _.extend({ provider: provider }, error));

      self.showErrorMessage(message);
      self.stopLoading();
    });

    return p;
  },

  startLoading: function() {
    if (this.isLoading) { return; }

    this.$el.addClass('hull-loading');
    this.isLoading = true;
  },

  stopLoading: function() {
    if (!this.isLoading) { return; }

    this.$el.removeClass('hull-loading');
    this.isLoading = false;
  },

  showErrorMessage: function(message) {
    if (this.options.showErrors === false) { return; }

    var $error = $(document.createElement('p')).addClass('hull-error').html(message);
    this.$errorContainer.html($error);
  },

  getClasses: function() {
    var classes = [];
    classes.push('hull-' + (this.options.inline ? 'inline' : 'block'));
    if (this.isLoading) { classes.push('hull-loading'); }

    return classes.join(' ');
  },

  getProviderMessages: function(provider) {
    this._providerMessages = this._providerMessages || {};

    if (!this._providerMessages[provider]) {
      var _ =  this.sandbox.util._;

      var locals = { provider: _.string.titleize(provider) };
      this._providerMessages[provider] = _.reduce(this.actionMessages, function(memo, a) {
        memo[a] = this.compileMessage(a, locals);
        return memo;
      }, {}, this);
    }

    return this._providerMessages[provider];
  },

  compileMessage: function(key, locals) {
    this._templates = this._templates || {};

    if (!this._templates[key]) {
      this._templates[key] = this.sandbox.util.Handlebars.compile(this.options[key] || this.defaultMessages[key]);
    }

    return this._templates[key](locals);
  },

  injectLinkTag: function() {
    if (this.linkTagInjected || this.options.injectLinkTag === false) { return; }

    var e = document.createElement('link');
    e.href = this.options.baseUrl + '/style.css';
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.linkTagInjected = true;
  }
});
