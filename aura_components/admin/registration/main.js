/**
 * 
 * List registration form entries.
 *
 * @name Registration
 * @template {admin} The main template. It shows the list of your quizzes or the form to edit a quiz.
 * @template {list}  Show the list of your quizzes and a form to add new quizzes.
 * @template {form}  Show the form to edit a quiz.
 * @datasource {quizzes} The collection of all the quizzes available in the application.
 * @example <div data-hull-component="admin/registration@hull"></div>
 */
Hull.define({
  type: 'Hull',

  templates: ['registration'],

  datasources: {
    fields: function() {
      var extra = this.api.model('app').get('extra');
      return extra.profile_fields || {};
    }
  },

  afterRender: function(data) {
    this.$fieldsJSON = this.$('[data-hull-field="field"]');
    this.$fieldsJSON.val(JSON.stringify(data.fields, null, 2));
  },

  actions: {
    update: function(e) {
      e.preventDefault();

      var data = {
        extra: { profile_fields: this.parseJSON(this.$fieldsJSON.val()) }
      };

      this.update(data);
    }
  },

  update: function(data) {
    this.api('app', 'put', data).done(function() {
      alert('Your fields have been saved');
    }).fail(function() {
      alert("Something went wrong, check that you're logged in correctly");
    });
  },

  parseJSON: function(json) {
    try {
      return $.parseJSON(json);
    } catch (err) {
      alert('JSON is not valid');
    }
  }
});
