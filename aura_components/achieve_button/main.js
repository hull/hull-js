/**
 * ## Achievement button
 *
 * A button that lets your users win a badge for an achievement you've previously defined.
 *
 * Basically, the component works as follows: specify the secret of the achievemnt at component declaration, and the achievement will be unlockable immediately.
 *
 * Using server-side hooks, you can also build personal and restricted badges, like badges that require a certain action to be won. See the [hooks documentation]() to discover how they work.
 *
 * ### Example
 *
 *     <div data-hull-component="achieve_button@hull" data-hull-id="ACHIEVEMENT_ID"></div>
 *
 * ### Options
 *
 * - `id`: Required, the achievement to unlock
 * - `secret`: Optional, the secret code to the achievement.
 *
 * ### Template
 *
 * - `achieve_button`: Displays the status of the achievement as well as a button so the user can unlock himself the achievement.
 *
 * ### Action
 *
 * - `achieve`: Achieve the achievement
 *
 * ### Related
 *
 * - Component `admin/achievements` to create achievements
 * - Achievements/Badges API
*/
Hull.define({
  type: 'Hull',
  requiredOptions: ['id', 'secret'],

  templates: ['achieve_button', 'achieve_error'],

  actions: {
    achieve: function() {
      var self = this;
      this.api(this.id + '/achieve', 'post', { secret: this.options.secret }).then(function () {
        self.refresh();
      }, function (err) {
        self.renderError(err.statusText);
      });
    }
  },

  onAchievementError: function (error) {
    this.actions.achieve = function () {};
  },

  renderError: function (errorMessage) {
    this.$el.html(this.renderTemplate('achieve_error', {message: errorMessage}));
  },

  datasources: {
    achievement: function() {
      return this.api(this.id);
    }
  },

  beforeRender: function(data) {
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
