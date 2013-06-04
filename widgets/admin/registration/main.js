/**
 *
 * # Registration form admin panel
 *
 */
define({
  type: 'Hull',

  templates: [
    'intro'
  ],

  datasources: {
    fields: function() {
      var extra = this.api.model('app').get('extra');
      return extra.profile_fields || {};
    }
  },

  afterRender: function(data) {
    this.$appSecret = this.$('#hull-app-secret');
    this.$fieldsJSON = this.$('#hull-fields-json');

    this.$fieldsJSON.val(JSON.stringify(data.fields, null, 2));
  },

  actions: {
    updateFields: function(e) {
      e.preventDefault();

      var data = {
        extra: { profile_fields: this.parseJSON(this.$fieldsJSON.val()) }
      };

      this.updateFields(data);
    }
  },

  updateFields: function(data) {
    this.api('app', 'put', data).done(function() {
      alert('Your fields has been saved');
    }).fail(function() {
      alert('Sothing went wrong, check your app secret and verify if your JSON is well formated');
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
