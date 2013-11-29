/**
 * Shows a vote button, with number of votes
 *
 * @name Button
 * @param {String} id The object to vote on.
 * @datasource {target} Info on the object.
 * @datasource {credits} The user credit for the current period
 * @template {main} The main template.
 * @example <div data-hull-component="votes/button@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="votes/button@hull" data-hull-id="entity:http://hull.io"></div>
 */

Hull.component({
  templates: ['main'],

  refreshEvents: ['model.hull.me.change'],

  requiredOptions: ['id'],

  datasources: {
    target: ':id',
    credits: function() {
      return this.loggedIn() ? this.api('me/credits') : false;
    }
  },

  onCreditsError: function () {
    return false;
  },

  beforeRender: function(data) {
    data.votesSum = data.target.stats.votes.sum || 0;

    if (data.credits === false) { return; }

    if(data.credits.votes.remaining === 0) {
      data.noRemainingPeriod = true;
    } else if(data.credits.votes.max_per_object === data.credits.votes.credited[this.getBSONId(data)]) {
      data.noRemainingObject = true;
    } else {
      data.canVote = true;
    }
  },

  getBSONId: function(data) {
    if (this.sandbox.util._.include(['me', 'app', 'org'], this.options.id)) {
      return data[this.options.id].id;
    } else {
      return this.options.id;
    }
  },

  actions: {
    vote: function() {
      if(this.working) return;

      this.working = true;

      this.api(this.options.id + '/votes', 'post').then(this.sandbox.util._.bind(function() {
        this.working = false;
        this.render();
      }, this), function(x) {
        alert(x.responseJSON.message);
      });
    }
  }
});
