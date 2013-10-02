/**
 *
 * A button that lets your users win a badge for an achievement you've previously defined.
 *
 * Basically, the component works as follows: specify the secret of the achievemnt at component declaration, and the achievement will be unlockable immediately.
 *
 * Using server-side hooks, you can also build personal and restricted badges, like badges that require a certain action to be won. See the [hooks documentation]() to discover how they work.
 *
 * @name Button
 * @param {String} id     Required, the achievement to unlock
 * @param {String} secret Optional, the secret code to the achievement.
 * @action {achieve} Achieve the achievement with the entered secret
 * @example <div data-hull-component="achievements/button@hull" data-hull-id="51a8a8a1aaf8a39ab6000686" data-hull-secret="achievement_secret"></div>
*/
Hull.component({
  type: 'Hull',
  requiredOptions: ['id', 'secret'],

  templates: ['button', 'error'],

  actions: {
    achieve: function() {
      var self = this;
      this.api(this.id + '/achieve', 'post', { secret: this.options.secret }).then(function () {
        self.refresh();
      }, function (err) {
        self.renderError(err.responseJSON.message);
      });
    }
  },

  onAchievementError: function (error) {
    this.actions.achieve = function () {};
  },

  renderError: function (errorMessage) {
    this.$el.html(this.renderTemplate('error', {message: errorMessage}));
  },

  datasources: {
    achievement: function() {
      return this.api(this.id);
    }
  },

  beforeRender: function(data) {
    console.log(data)
    if (data.achievement && data.achievement.badge) {
      data.isAchieved = true;
    } else {
      data.isAchieved = false;
      if (data.loggedIn && this.options.secret) {
        data.canAchieve = true;
      } else {
        data.canAchieve = false;
      }
    }
    return data;
  }
});
