/**
 *
 * A button that lets your users win a badge for an achievement you've previously defined.
 *
 * Basically, the widget works as follows: specify the secret of the achievemnt at widget declaration, and the achievement will be unlockable immediately.
 *
 * Using server-side hooks, you can also build personal and restricted badges, like badges that require a certain action to be won. See the [hooks documentation]() to discover how they work.
 *
 * ## Example
 *
 *     <div data-hull-widget="achieve_button@hull" data-hull-id="ACHIEVEMENT_ID"></div>
 *
 * ## Options
 *
 * - `id`: Required, the achievement to unlock
 * - `secret`: Optional, the secret code to the achievement.
 *
 * ## Template
 *
 * - `achieve_button`: Displays the status of the achievement as well as a button so the user can unlock himself the achievement.
 *
 * ## Action
 *
 * - `achieve`: Achieve the achievement
 *
 * ## Related
 *
 * - Widget `admin/achievements` to create achievements
 * - Achievements/Badges API
*/
define({
  type: 'Hull',

  templates: ['achieve_button'],

  actions: {
    achieve: function() {
      this.api(this.id + '/achieve', 'post', { secret: this.options.secret }).then(this.refresh);
    }
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
