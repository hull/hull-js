/**
 *# Achieve Button:
 *
 * A button that lets a user achieve an something.
 *
 * Using this widget you can implement two very useful functionalities:
 *
 * - **Basic Checkins**: without any sort of verification : just specify in the secret in plain text, and the achievement will be unlockable immediately.
 * - **Restricted Checkins**: Do not write the secret in plain text.  Instead, use the server library to compute a user-specific token, and use it only when you want your user to be able to checkin.  The user will then be able to unlock the achievement using a unique token, only valid for him and for a limited time.  Check out the Kitchensink for a working example.
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
 * - `achieve_button`: Displays the status of he achievement as well as a button so the suer can unlock himself the achievement.
 *
 * ## Action
 *
 * - `achieve`: Achieve the achievement
*/
define({
  type: 'Hull',

  templates: ['achieve_button'],

  actions: {
    achieve: function() {
      this.api('hull/' + this.id + '/achieve', 'post', { secret: this.options.secret }).then(this.refresh);
    }
  },

  datasources: {
    achievement: function() {
      return this.api('hull/' + this.id);
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
