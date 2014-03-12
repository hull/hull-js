Hull.component({
  templates: ['default'],

  refreshEvents: ['model.hull.me.change'],

  linkTagInjected: false,

  initialize: function() {
    this.isLoading = false;

    this.sandbox.on('hull.shopify.loading.start', this.startLoading, this);
    this.sandbox.on('hull.shopify.loading.stop', this.stopLoading, this);

    this.injectLinkTag();
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

  beforeRender: function(data) {
    var _ = this.sandbox.util._;

    this.template = this.options.theme && _.contains(this.templates, this.options.theme) ? this.options.theme : 'default';

    var classes = [];
    classes.push('hull-theme-' + this.template);
    classes.push('hull-' + (this.options.inline ? 'inline' : 'block'));
    if (this.isLoading) { classes.push('hull-loading'); }
    data.classes = classes.join(' ');

    var l = this.loggedIn();
    data.providers = _.reduce(this.authServices(), function(m, p) {
      m[p] = !!l[p] && { isUnlinkable: l && data.me.main_identity !== p };
      return m;
    }, {});

    data.showLinkIdentity = this.options.showLinkIdentity !== false;
  },

  afterRender: function() {
    this.$errorContainer = this.$('.hull-error-container');
  },

  injectLinkTag: function() {
    if (this.linkTagInjected || this.options.injectLinkTag === false) { return; }

    var e = document.createElement('link');
    e.href = this.options.baseUrl + '/style.min.css';
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.linkTagInjected = true;
  },

  callAndStartLoading: function(methodName, provider, handleSuccess) {
    this.$errorContainer.html('');

    this.startLoading();

    this.$el.addClass('hull-' + methodName);

    var self = this;
    this.sandbox[methodName](provider).then(function() {
      if (handleSuccess) { self.stopLoading(); }
    }, function(error) {
      self.showErrorMessage(error.message);
      self.stopLoading();
    });
  },

  showErrorMessage: function(message) {
    if (this.options.showErrors === false) { return; }

    var $error = $(document.createElement('p')).addClass('hull-error').text(message);
    this.$errorContainer.html($error);
  },

  actions: {
    _login: function(event, action) {
      this.callAndStartLoading('login', action.data.provider);
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
  }
});
