/**
 * Create a csv of users that have participated to one or more quizzes.
 *
 * @name Quizzes export
 * @tmpl {main} The main template. shows a form that allow admin to select the email where the export csv will be sent.
 * @datasource {quizzes} The collection of all the quizzes available in the application.
 * @example <div data-hull-component="admin/quizzes_export@hull"></div>
 */
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
