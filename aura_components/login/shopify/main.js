Hull.component({
  templates: [
    'default',
    'icons'
  ],

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.injectLinkTag();
  },

  beforeRender: function(data) {
    this.template = this.options.theme || 'default';

    var classes = [];
    classes.push('hull-theme-' + this.template);
    classes.push('hull-' + (this.options.inline ? 'inline' : 'block'));

    data.classes = classes.join(' ');

    data.providers = this.authServices() || [];
    // If I'm logged in, then create an array of logged In providers
    if(this.loggedIn()){
      data.loggedInProviders = this.sandbox.util._.keys(this.loggedIn());
    } else {
      data.loggedInProviders = [];
    }

    // Create an array of logged out providers.
    data.loggedOut = this.sandbox.util._.difference(data.providers, data.loggedInProviders);
    data.matchingProviders = this.sandbox.util._.intersection(data.providers, data.loggedInProviders);
    data.authServices = this.authServices();

    return data;
  },

  injectLinkTag: function() {
    if (this.options.injectLinkTag === false) { return; }

    var e = document.createElement('link');
    // TODO How to not hardcode this url?
    e.href = 'https://js.hull.dev/dist/shopify.css';
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);
  }
});
