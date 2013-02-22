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
  templates: [
    /**
     * Show the button to play to the game.
     */
    'instant_intro',
    /**
     * Show a loading message.
     */
    'instant_working',
    /**
     * Say to the user that he has won
     */
    'instant_won',
    /**
     * Say to the user that he has lost.
     */
    'instant_lost',
    /**
     * Say to the user that he has already played.
     */
    'instant_played',
    /**
     * Say to the user that the game hasn't started yet.
     */
    'instant_unstarted',
    /**
     * Say to the user that the game has ended.
     */
    'instant_ended'
  ],

  datasources: {
    /**
     * The user's badges.
     */
    badges: function() {
      return this.loggedIn() ? this.api('hull/me/badges') : [];
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
   * - `instant_intro`: if the user hasn't played during the current day.
   * - `instant_played`: if the user has played during the current day.
   * - `instant_unstarted`: if the game hasn't started.
   * - `instant_ended`: if the game has ended.
   *
   * @return {String}
   */
  getInitialTemplate: function() {
    if (this.hasEnded()) {
      return 'instant_ended';
    } else if (this.hasStarted()) {
      return this.userCanPlay() ? 'instant_intro' : 'instant_played';
    } else {
      return 'instant_unstarted';
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
   * Determine if the game has ended. return `true` if it has `false` if it
   * hasn't.
   *
   * @return {Boolean}
   */
  hasEnded: function() {
    // TODO Need achievement `end_date`
    return false;
  },

  /**
   * Determine if the user can play. return `true` if he can `false` if he
   * cannot.
   *
   * @return {Boolean}
   */
  userCanPlay: function() {
    var badge = _.where(this.data.badges, { 'achievement_id': this.id })[0];
    if (badge === null || badge === undefined) { return true; }
    var d = new Date().toISOString().slice(0,10);
    return !badge.data.attempts[d];
  },

  /**
   * Play to the game and render a template:
   *
   * - `instant_won`: if the user has won.
   * - `instant_lost`: if the user has lost.
   * - `instant_played`: if the user has played during the current day.
   *
   * When the function is called we render `instant_working` and display it
   * until we know if the user has won.
   */
  play: function() {
    var suspense = this.wait(this.options.delay || 0);
    this.render('instant_working');

    this.api('hull/' + this.id + '/achieve', 'post', _.bind(function(res) {
      var template = 'instant_played';
      if (this.userCanPlay()) {
        template = 'instant_' + (res.data.winner ? 'won' : 'lost');
      }
      suspense.then(_.bind(function() {
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
    return this.sandbox.data.deferred(function(dfd) {
      setTimeout(dfd.resolve, time);
    }).promise();
  }
});
