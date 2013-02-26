/**
 * # Instant Win
 *
 * A type of game where the player win or lose instantly.
 *
 * ## Parameters
 *
 * - `provider`: The identity provider to log with before playing. By default it
 *   will list all your identity providers.
 * - `delay`: Time in milliseconds to wait before displaying the game's results.
 *   By default the results are displayed imediatly after that the server tell
 *   us if the user has win or lost.
 */
define({
  type: 'Hull',

  templates: [
    /**
     * Show the button to play to the game.
     */
    'intro',
    /**
     * Show a loading message.
     */
    'working',
    /**
     * Say to the user that he has won
     */
    'won',
    /**
     * Say to the user that he has lost.
     */
    'lost',
    /**
     * Say to the user that he has already played.
     */
    'played',
    /**
     * Say to the user that the game hasn't started yet.
     */
    'unstarted',
    /**
     * Say to the user that the game has ended.
     */
    'ended'
  ],

  refreshEvents: ['model.hull.me.change'],

  datasources: {
    /**
     * The InstantWin achievement
     */
    achievement: function() {
      return this.api('hull/' + this.options.id);
    },
    /**
     * The user's badge for the InstantWin
     */
    badge: function() {
      return this.loggedIn() ? this.api('hull/me/badges/' + this.options.id) : null;
    }
  },

  actions: {
    /**
     * Ensure that the user is logged and call the `play` method.
     */
    play: function(source, event, data) {
      if (this.loggedIn()) {
        this.play();
      } else {
        var provider = data.provider || this.options.provider;
        Hull.login(provider, {}, _.bind(this.play, this));
      }
    }
  },

  initialize: function() {
    this.authProviders = _.map(this.sandbox.config.services.types.auth, function(s) {
      return s.replace(/_app$/, '');
    });
  },

  beforeRender: function(data) {
    this.template = this.getInitialTemplate();
    data.authProviders = this.authProviders;
  },

  /**
   * Return the template name that the user should see when he lands on the
   * game.
   *
   * - `intro`: if the user hasn't played during the current day.
   * - `won`: if the user has won a prize.
   * - `played`: if the user has played during the current day.
   * - `unstarted`: if the game hasn't started.
   * - `ended`: if the game has ended.
   *
   * @return {String}
   */
  getInitialTemplate: function() {
    if (this.userHasWon()) {
      return 'won';
    } else if (this.hasEnded()) {
      return 'ended';
    } else if (this.hasStarted()) {
      return this.userCanPlay() ? 'intro' : 'played';
    } else {
      return 'unstarted';
    }
  },

  /**
   * Determine if the game has started. return `true` if it has `false` if it
   * hasn't.
   *
   * @return {Boolean}
   */
  hasStarted: function() {
    // TODO Need achievement `start_date`
    return true;
  },

  /**
   * Determine if the game has ended. Return `true` if it has `false` if it
   * hasn't.
   *
   * @return {Boolean}
   */
  hasEnded: function() {
    // TODO Need achievement `end_date`
    return false;
  },

  /**
   * Determine if the user can play. Return `true` if he can `false` if he
   * cannot.
   *
   * @return {Boolean}
   */
  userCanPlay: function() {
    if (!this.data.badge) { return true; }
    var d = new Date().toISOString().slice(0, 10);
    return !this.data.badge.data.attempts[d];
  },

  /**
   * Determine if user has won. Return `true` if the he has, `false` if he
   * hasn't.
   *
   * @return {Boolean}
   */
  userHasWon: function() {
    if (!this.data.badge) { return false; }
    return this.data.badge.data.winner;
  },

  /**
   * Play to the game and render a template:
   *
   * - `won`: if the user has won.
   * - `lost`: if the user has lost.
   * - `played`: if the user has played during the current day.
   *
   * When the function is called we render `working` and display it
   * until we know if the user has won.
   */
  play: function() {
    if (this.userHasWon()) { return; }

    var delay = this.wait(this.options.delay || 0);
    this.render('working');

    this.api('hull/' + this.id + '/achieve', 'post', _.bind(function(res) {
      var template = 'played';
      if (this.userCanPlay()) {
        template = res.data.winner ? 'won' : 'lost';
      }
      delay.then(_.bind(function() {
        this.render(template);
      }, this));
    }, this));
  },

  /**
   * Wait a given `time` before resolving the returned deferred.
   *
   * @param {Integer} time Number of milliseconds to wait.
   * @return {Promise}
   */
  wait: function(time) {
    var deferred = this.sandbox.data.deferred();
    time = parseInt(time, 10) || 0;

    if (time <= 0) {
      deferred.resolve();
    } else {
      setTimeout(deferred.resolve, time);
    }

    return deferred.promise();
  }
});
