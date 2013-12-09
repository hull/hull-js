Hull.component({
  templates: ['main'],

  datasources : {
    quizzes : {
      path: 'app/achievements',
      params: { where: { _type: 'Quiz'} }
    }
  },

  beforeRender: function(data) {
    var _ = this.sandbox.util._;

    var fields = ['user_id', ['name', 'Name'], ['email', 'Email']];

    if (_.isArray(data.app.extra.profile_fields)) {
      _.each(data.app.extra.profile_fields, function(f) {
        if (f.name == null || f.label == null) return;

        key = ['apps', data.app.id, 'profile', f.name].join('.');
        value = f.label + ' (registration form)';

        fields.push([key, value]);
      });
    }

    _.each(data.quizzes, function(q) {
      _.each([
        ['best_score', 'Score'],
        ['data.timing', 'Timing'],
        ['stats.attempts', 'Attempts']
      ], function(k) {
        key = ['apps', data.app.id, 'badges', q.id, k[0]].join('.');
        value = k[1] + ' (quiz: ' + q.name + ')';

        fields.push([key, value]);
      });
    });

    this.fields = fields;
  },

  actions: {
    extract: function(event, action) {
      var email = this.$('input[type="email"]').val();

      this.api('app/user_reports/extracts', 'post', {
        email: email,
        fields: this.fields
      }).always(function(r) {
        alert(r.message);
      });
    }
  }
});
