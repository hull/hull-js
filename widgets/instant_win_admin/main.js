define({
  type: 'Hull',

  templates: ['intro'],

  datasources: {
    achievements: function() {
      return this.api('hull/app/achievements', {
        where: { _type: 'InstantWin' }
      });
    }
  },

  afterRender: function() {
    this.$achievementsSelector = $('#hull-achievement-id');
    this.$achievementName = $('#hull-instant-update-name');
    this.$achievementDescription = $('#hull-instant-update-description');
    this.$achievementSecret = $('#hull-instant-update-secret');
    this.$achievementPrizes = $('#hull-prizes-json');

    this.showAchievement();
    this.$achievementsSelector.on('change', _.bind(this.showAchievement, this));
  },


  showAchievement: function() {
    var id = this.$achievementsSelector.val();
    var achievement = _.where(this.data.achievements, { id: id })[0];
    if(achievement){
      this.$achievementName.val(achievement.name);
      this.$achievementDescription.val(achievement.description);
      this.$achievementSecret.val(achievement.secret);

      this.api('hull/' + id + '/prizes').then(_.bind(function(res) {
        var code = {
          prizes: _.map(res || [], function(p) {
            return _.pick(p, 'id', 'name', 'description', 'available_at', 'extra');
          })
        };
        this.$achievementPrizes.val(JSON.stringify(code, null, 2));
      }, this));
    }
  },

  actions: {
    create: function(source, e) {
      e.preventDefault();

      var description = $('#hull-instant-description').val();
      var secret = $('#hull-instant-secret').val();
      var data = {
        type: 'instant_win',
        name: $('#hull-instant-name').val()
      }
      if (description.length) { data.description = description; }
      if (secret.length) { data.secret = secret; }

      this.api('hull/app/achievements', 'post', data).done(_.bind(function(res) {
        alert('Instant Win Created');
        this.refresh();
      }, this)).fail(function() {
        alert('Cannot create Instant Win');
      });
    },

    updateAchievement: function() {
      var id = this.$achievementsSelector.val();

      var description = this.$achievementDescription.val();
      var secret = this.$achievementSecret.val();

      var data = { name: this.$achievementName.val() };
      if (description.length) { data.description = description; }
      if (secret.length) { data.secret = secret; }

      this.api('hull/' + id, 'put', data).done(function() {
        alert('Achievement Updated');
      }).fail(function() {
        alert('Ooops... Check the form...');
      });
    },

    updatePrizes: function() {
      try {
        var prizes = $.parseJSON(this.$achievementPrizes.val());
      } catch (error) {
        alert('Invalid JSON');
      }

      var id = this.$achievementsSelector.val();

      this.api('hull/' + id + '/prizes', 'put', prizes).done(function() {
        alert('Prizes updated!');
      }).fail(function() {
        alert('Ooops... check your JSON...');
      });
    }
  }
});
