define({
  type: 'Hull',

  templates: ['instant_admin'],

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
    this.$achievementPrizes = $('#hull-prizes-json');

    this.showAchievement();
    this.$achievementsSelector.on('change', _.bind(this.showAchievement, this));
  },


  showAchievement: function() {
    var id = this.$achievementsSelector.val();
    var achievement = _.where(this.data.achievements, { id: id })[0];

    this.$achievementName.val(achievement.name);
    this.$achievementDescription.val(achievement.description);

    this.api('hull/' + id + '/prizes').then(_.bind(function(res) {
      var code = {
        prizes: _.map(res || [], function(p) {
          return _.pick(p, 'id', 'name', 'description', 'available_at', 'extra');
        })
      };
      this.$achievementPrizes.val(JSON.stringify(code, null, 2));
    }, this));
  },

  actions: {
    create: function(source, e) {
      e.preventDefault();

      this.api('hull/app/achievements', 'post', {
        type: 'instant_win',
        name: $('#hull-instant-name').val(),
        description: $('#hull-instant-description').val()
      }).done(_.bind(function(res) {
        alert('Instant Win Created');
        this.refresh();
      }, this)).fail(function() {
        alert('Cannot create Instant Win');
      });
    },

    updateAchievement: function() {
      var id = this.$achievementsSelector.val();

      this.api('hull/' + id, 'put', {
        name: this.$achievementName.val(),
        description: this.$achievementDescription.val()
      }).done(function() {
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
