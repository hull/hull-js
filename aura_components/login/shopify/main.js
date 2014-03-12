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
      m[p] = !!l[p];
      return m;
    }, {});

    data.isLoading = this.isLoading;

    data.showLinkIdentity = this.options.showLinkIdentity !== false;
  },

  injectLinkTag: function() {
    if (this.linkTagInjected || this.options.injectLinkTag === false) { return; }

    var e = document.createElement('link');
    e.href = this.options.baseUrl + '/style.min.css';
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.linkTagInjected = true;
  },

  callAndStartLoading: function(methodName, provider) {
    this.startLoading();

    this.$el.addClass('hull-' + methodName);

    var self = this;
    this.sandbox[methodName](provider).fail(function(error) {
      self.stopLoading();
    });
  },

  actions: {
    _login: function(event, action) {
      this.callAndStartLoading('login', action.data.provider);
    },

    _logout: function(event, action) {
      this.callAndStartLoading('logout', action.data.provider);
    }
  }
});
