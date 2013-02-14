define(['sandbox', 'underscore', 'jquery.default_fields', 'h5f'], function(sandbox, _, default_fields) {

  return {

    type: "Hull",
    namespace :'registration',
    templates: ['registration_form', 'registration_complete'],
    complete: false,
    default_fields: default_fields,
    formId: (new Date()).getTime(),

    events: {
      'submit form' : 'submitForm'
    },

    datasources: {
      fields: function() {
        return this.default_fields || [];
      }
    },

    initialize : function(options, callback) {
      _.bindAll(this);
    },

    validate: function() {
      var isValid = document.getElementById(this.formId).checkValidity();
      if(isValid) return isValid;
      this.$el.find('[data-hull-input]').each(function(key,el){
        var $el = $(el),
            id = $el.attr('id');
        $('#'+id+'-error').text( (el.checkValidity()) ? '' : $el.attr('data-error-message'));
      });
      return false;
    },

    register: function(profile) {
      var self  = this;
          me    = this.sandbox.data.api.model('me');
      if (this.loggedIn()) {
        this.api('hull/me/profile', 'put', profile, function(myAttrs) {
          me.set(myAttrs);
          self.trigger('register', this);
          self.render();
        });
      }
    },

    beforeRender: function(data) {
      var extra = data.me && data.me.profile || {};
      data.formId = this.formId;
      data.isComplete = _.all(_.map(data.fields, function(f) {
        f.value = extra[f.name] || data.me[f.name];
        return f.value;
      }));
      if (data.isComplete) {
        this.template = "registration_complete";
      } else {
        this.template = "registration_form";
      }
      this.fields = data.fields;
      return data;
    },

    afterRender: function() {
      H5F.setup(document.getElementById(this.formId),{
          validClass: "hull-form__input--valid",
          invalidClass: "hull-form__input--invalid",
          requiredClass: "hull-form__input--required",
          placeholderClass: "hull-form__input--placeholder"
      });
    },

    submitForm: function() {
      this.actions.submit.apply(this, arguments)
    },

    actions: {
      edit: function(source, e, opts) {
        e.preventDefault();
        e.stopPropagation();
        this.render("registration_form");
        return false;
      },

      submit: function(source, e, opts) {
        e && e.preventDefault()

        if (!this.validate()) {
          e && e.stopPropagation();
          e && e.stopImmediatePropagation();
          return false
        }

        var fields = _.clone(this.fields),
            extra  = {},
            el = this.$el;

        _.map(fields, function(field) {
          if (field.type == 'checkbox') {
            extra[field.name] = el.find(".h5-" + field.name).is(":checked");
          } else {
            extra[field.name] = el.find(".h5-" + field.name).val();
          }
        });

        this.register(extra);
      }
    }
  };
});
