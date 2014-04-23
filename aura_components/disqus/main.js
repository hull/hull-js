Hull.component({
  refreshEvents: ['model.hull.me.change'],
  initialize: function () {
    this.configureDisqus(window, 'disqus_config');
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + window.disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    this.$el.attr('id', 'disqus_thread');

    window.onhashchange = function () {
      if (window.location.hash.indexOf("#logout") !== -1) {
        Hull.logout();
        window.location.hash = "";
      }
    }
  },
  doRender: function () {
    var config = { reload: true };
    this.configureDisqus(config, 'config');
    window.DISQUS && DISQUS.reset(config);
  },
  configureDisqus: function (container, property) {
    //TODO The following needs to be fixed
    var credentials = this.sandbox.config.services.comments.disqus_site || this.sandbox.config.services.comments.disqus;
    var shortName = credentials.shortname;
    var pageConfig = credentials.config.page,
        api_key = pageConfig.api_key;
    container.disqus_shortname = shortName;
    if (this.loggedIn()) {
      var remote_auth_s3 = pageConfig.remote_auth_s3 || {};
      this.$el.show();
    } else {
      var remote_auth_s3 = {};
      this.$el.hide();
    }
    container[property] = function () {
      this.page.remote_auth_s3 = remote_auth_s3;
      this.page.api_key = api_key;
      this.sso = {
        logout: window.location + '#logout'
      }
    }
  }
});
