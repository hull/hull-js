/**
 *
 * A packaged Sweepstake game
 *
 * A sweepstake is a game where the player finds out immediately if he or she is a winner of one of the prizes the administrators put at stake.
 *
 * A player can play once a day provided he or she loses at each attempt. A player that wins the prize will not be allowed to play the game anymore.
 *
 * To create a sweepstake, use the `admin/sweepstake@hull` component which will let you create a sweepstake and add prizes to it.
 *
 * @name Sweepstake
 * @param {String} id       Required, the sweepstake achievement id.
 * @param {String} provider Optional, the identity provider to log with before playing. By default it will list all your identity providers.
 * @param {String} delay    Optional, time in milliseconds to wait before displaying the game's results. By default the results are displayed imediatly after that the server tell us if the user has win or lost.
 * @template {intro}     Show the button to play to the game.
 * @template {buttons}   The play buttons partial.
 * @template {working}   Show a loading message.
 * @template {won}       Say to the user that he has won
 * @template {lost}      Say to the user that he has lost.
 * @template {played}    Say to the user that he has already played.
 * @template {unstarted} Say to the user that the game hasn`t started yet.
 * @template {ended}     Say to the user that the game has ended.
 * @datasource {achievement} The sweepstake achievement.
 * @datasource {badge}       The user's badge for the sweepstake.
 * @tracking {start} Sweepstake Started
 * @example <div data-hull-component="games/sweepstake@hull"  data-hull-id="5134cd06c4748aba2400003c"></div>
 */

Hull.component({
  type: 'Hull',

  templates: [
    'intro',
    'buttons',
    'working',
    'won',
    'lost',
    'played',
    'unstarted',
    'ended'
  ],

  trackingData: function() {
    var data = { type: 'instant_win' };
    var achievement = this.data.achievement;
    if (achievement && achievement.get) { data.name = achievement.get('name'); }
    return data;
  },

  refreshEvents: ['model.hull.me.change'],

  datasources: {
    achievement: ':id',
    badge: function() {
      return this.loggedIn() ? this.api('me/badges/' + this.options.id) : null;
    }
  },

  actions: {
    play: function(event, params) {
      var userLoggedIn = !!this.loggedIn();
      if (userLoggedIn) {
        this.play();
      } else {
        var provider = params.data.provider || this.options.provider;
        this.sandbox.login(provider);
        this.autoPlay = true;
      }

      this.track('start', { userLoggedIn: userLoggedIn });
    }
  },

  initialize: function() {
    this.authProviders = this.sandbox.util._.keys(this.sandbox.config.services.auth);
  },

  beforeRender: function(data) {
    this.template = this.getInitialTemplate();

    data.authProviders = this.authProviders;

    if (!this.isInitialized) {
      this.track('init', { initialTemplate: this.template });
    }
  },

  afterRender: function(data) {
    if (this.autoPlay) {
      this.autoPlay = false;
      if (!this.userHasWon()) { this.play(); }
    }

    if (this.template === 'won' || this.template === 'lost') {
      this.track('finish', { result: this.template });
    }

    this.sandbox.emit('hull.sweepstake.' + this.options.id + '.template.render', this.template);
  },

  /*!
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

  /*!
   * Determine if the game has started. return `true` if it has `false` if it
   * hasn't.
   *
   * @return {Boolean}
   */
  hasStarted: function() {
    // TODO Need achievement `start_date`
    return true;
  },

  /*!
   * Determine if the game has ended. Return `true` if it has `false` if it
   * hasn't.
   *
   * @return {Boolean}
   */
  hasEnded: function() {
    // TODO Need achievement `end_date`
    return false;
  },

  /*!
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

  /*!
   * Determine if user has won. Return `true` if the he has, `false` if he
   * hasn't.
   *
   * @return {Boolean}
   */
  userHasWon: function() {
    if (!this.data.badge || !this.data.badge.data) { return false; }
    return this.data.badge.data.winner;
  },

  /*!
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
    "use strict";
    this.render('working');
    this.api(this.id + '/achieve', 'post', this.sandbox.util._.bind(function(res) {
      var template = 'played';
      if (this.userCanPlay()) { template = res.data.winner ? 'won' : 'lost'; }
      this.sandbox.util._.delay(this.sandbox.util._.bind(function() {
        this.render(template);
      }, this), parseInt(this.options.delay, 10) || 0);
    }, this));
  }
});
