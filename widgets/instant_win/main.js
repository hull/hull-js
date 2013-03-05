/**
 * # Instant Win
 *
 * An instant-win is a game where the player finds out immediately if he or she
 * is a winner of one of the prizes the administrators put at stake.
 *
 * A player can play once a day provided he or she loses at each attempt. A
 * player that wins the prize will not be allowed to play the game anymore.
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
     * The play buttons partial.
     */
    'buttons',
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
    achievement: ':id',
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
      var userLoggedIn = !!this.loggedIn();
      if (userLoggedIn) {
        this.play();
      } else {
        var provider = data.provider || this.options.provider;
        this.sandbox.login(provider);
        this.autoPlay = true;
      }

      this.track('start', { userLoggedIn: userLoggedIn });
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

    if (!this.isInitialized) {
      this.track('init', { initialTemplate: this.template });
    }
  },

  afterRender: function() {
    this.sandbox.emit('hull.instant_win.' + this.options.id + '.template.render', this.template);

    if (this.autoPlay) {
      this.autoPlay = false;

      if (this.userHasWon()) {
        this.track('finish', {
          result: 'won',
          attempts: this.data.badge.data.attempts
        });
      } else {
        this.play();
      }
    }
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
    if (!this.data.badge || !this.data.badge.attempts) { return true; }
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
    this.render('working');
    this.api('hull/' + this.id + '/achieve', 'post', _.bind(function(res) {
      var template = 'played';
      if (this.userCanPlay()) { template = res.data.winner ? 'won' : 'lost'; }
      _.delay(_.bind(function() {
        this.render(template);
      }, this), parseInt(this.options.delay, 10) || 0);

      this.track('finish', { result: template, attempts: res.data.attempts });
    }, this));
  }
});
