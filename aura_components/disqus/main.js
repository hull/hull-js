Hull.component({
  refreshEvents: ['model.hull.me.change'],
  initialize: function () {
    this.configureDisqus(window, 'disqus_config');
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + window.disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    this.$el.attr('id', 'disqus_thread');
  },
  doRender: function () {
    if (this.loggedIn()) {
      this.$el.show();
      var config = { reload: true };
      this.configureDisqus(config, 'config');
      window.DISQUS && DISQUS.reset(config);
    } else {
      this.$el.hide();
    }
  },
  configureDisqus: function (container, property) {
    //TODO The following needs to be fixed
    var credentials = this.sandbox.config.services.comments.disqus_site || this.sandbox.config.services.comments.disqus;
    var shortName = credentials.shortname;
    container.disqus_shortname = shortName;
    if (this.loggedIn()) {
      var pageConfig = credentials.config.page,
          remote_auth_s3 = pageConfig.remote_auth_s3 || {},
          api_key = pageConfig.api_key;
      container[property] = function () {
        this.page.remote_auth_s3 = remote_auth_s3;
        this.page.api_key = api_key;
      }
    } else {
      this.$el.hide();
    }
  }
});
