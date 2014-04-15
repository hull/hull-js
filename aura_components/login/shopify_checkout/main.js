Hull.component({
  templates: ['main'],

  refreshEvents: ['model.hull.me.change'],

  linkTagInjected: false,

  initialize: function() {
    this.$target = $(this.options.target || '#checkout');

    if (this.$target.length !== 1) {
      throw new Error('');
    }

    this.sandbox.on('hull.auth.login', this.targetClick, this);
    this.sandbox.on('hull.auth.fail', this.targetClick, this);

    this.injectLinkTag();
  },

  beforeRender: function() {
    this.$el.hide();
    this.$el.detach();
  },

  afterRender: function() {
    this.$dropdown = this.$('.hull-checkout-dropdown');

    var self = this;

    this.$dropdown.on('mouseenter', function() { self.enter(); });
    this.$dropdown.on('mouseleave', function() { self.leave(); });
    this.$target.on('mouseenter', function() { self.enter(); });
    this.$target.on('mouseleave', function() { self.leave(); });
  },

  targetClick: function() {
    this.hide();
    this.$target.click();
  },

  enter: function() {
    clearTimeout(this.timer);
    this.timer = null;

    if (this.loggedIn()) { return; }

    this.computePosition();
    this.show();
  },

  leave: function() {
    var self = this;
    this.timer = setTimeout(function() {
      //self.hide();
    }, 200);
  },

  show: function() {
    this.$el.fadeIn(200);
  },

  hide: function() {
    this.$el.fadeOut(200);
  },

  computePosition: function() {
    this.$el.offset({ top: -100000, left: -100000 });
    this.$el.appendTo('body');

    var offset = this.$target.offset();
    var css = {
      position: 'absolute',
      left: offset.left - (this.$dropdown.width() / 2) + (this.$target.outerWidth() / 2)
    };

    if (offset.top - $(window).scrollTop() >= this.$dropdown.outerHeight()) {
      this.$dropdown.addClass('hull-dropdown-above');
      this.$dropdown.removeClass('hull-dropdown-behind');
      css.top = offset.top - this.$dropdown.outerHeight() - 10;
    } else {
      this.$dropdown.addClass('hull-dropdown-behind');
      this.$dropdown.removeClass('hull-dropdown-above');
      css.top = offset.top + this.$target.outerHeight() + 10 - parseInt($('html').css('marginTop'), 10);
    }

    this.$el.css(css);
  },

  actions: {
    checkout: function() { this.$target.click(); }
  },

  injectLinkTag: function() {
    if (this.linkTagInjected || this.options.injectLinkTag === false) { return; }

    var e = document.createElement('link');
    e.href = this.options.baseUrl + '/style.min.css';
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.linkTagInjected = true;
  }
});
