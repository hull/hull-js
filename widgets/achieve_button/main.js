/**
 * Achieve Button:
 *
 * **Let a user achieve something**
 *
 * A button that lets a user achieve an achievement.
 *
 * * `data-hull-id="ACHIEVEMENT_ID"` : specify which achievement to unlock
 * * `data-hull-secret="SECRET"` : specify the secret.
 *
 * Using this widget you can implement two very useful functionalities:
 *
 * * **Basic Checkins**, without any sort of verification : just specify in the secret in plain text, and the achievement will be unlockable immediately.
 * * **Restricted Checkins** : Do not write the secret in plain text.
 * Instead, use the server library to compute a user-specific token, and use it only when you want your user to be able to checkin.
 * The user will then be able to unlock the achievement using a unique token, only valid for him and for a limited time.
 * Check out the Kitchensink for a working example.
 *
 * * **Server-side unlocked Achievements** : Don't use this widget at all. Instead use the server library to unlock an achievement for a user.
 * Check out the kitchensink for a working example.
*/


define({
  type: "Hull",
  templates: ["achieve_button"],
  actions: {
    achieve: function() {
      this.api("hull/" + this.id + "/achieve", "post", { secret: this.options.secret }).then(this.refresh);
    }
  },
  datasources: {
    achievement: function() { return this.api('hull/' + this.id); }
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
