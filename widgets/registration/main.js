define(['underscore', 'h5f'], function(_, H5F) {
  return {
    type: 'Hull',

    templates: ['registration_form', 'registration_complete'],

    complete: false,

    defaultFields: [
      {
        type : 'text',
        name : 'name',
        label : 'Name',
        value : '',
        required: true,
        error : 'Please enter your name',
        placeholder : 'bob'
      },
      {
        type : 'email',
        name : 'email',
        label : 'Email',
        value : '',
        required: true,
        error : 'Invalid Email',
        placeholder : 'you@awesome.com'
      }
    ],

    datasources: {
      fields: function() {
        var extra = this.sandbox.data.api.model('app').get('extra');
        return extra.profile_fields || this.defaultFields;
      }
    },

    initialize : function(options, callback) {
      this.formId = (new Date()).getTime();
      _.bindAll(this);
    },

    validate: function() {
      this._ensureFormEl();
      var isValid = this.formEl.checkValidity();
      if(isValid) return isValid;
      this.$el.find('[data-hull-input]').each(function(key, el){
        var $el = $(el),
            id = $el.attr('id');
        $('#'+id+'-error').text((el.checkValidity()) ? '' : $el.data('errorMessage'));
      });
      return false;
    },

    register: function(profile) {
      var self  = this;
          me    = this.sandbox.data.api.model('me');
      if (this.loggedIn()) {
        this.api('me/profile', 'put', profile, function(newProfile) {
          me.set('profile', newProfile);
          self.render();
        });
      }
    },

    beforeRender: function(data) {
      data.formId = this.formId;

      var fields = _.map(data.fields, function(f) {
        f.value = this._findFieldValue(f.name);
        return f;
      }, this);

      // Check if user.profile contains all the fields with their respective
      // value. If it's the case we consider the form as complete.
      var isComplete = _.every(fields, function(f) {
        var profileField = data.me.profile[f.name];
        if (f.type === 'checkbox') {
          return profileField == f.value;
        } else {
          return !!profileField && profileField === f.value;
        }
      });

      this.template = isComplete ? 'registration_complete' : 'registration_form';

      this.fields = fields;
    },

    afterRender: function() {
      if (this.template === 'registration_form') {
        this._ensureFormEl();
        H5F.setup(this.formEl, {
          validClass: "hull-form__input--valid",
          invalidClass: "hull-form__input--invalid",
          requiredClass: "hull-form__input--required",
          placeholderClass: "hull-form__input--placeholder"
        });
      }
    },

    actions: {
      edit: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.render("registration_form");
        return false;
      },

      submit: function(e, opts) {
        e && e.preventDefault();

        if (!this.validate()) {
          e && e.stopPropagation();
          e && e.stopImmediatePropagation();
          return false;
        }

        var fields = _.clone(this.fields),
            extra  = {},
            el = this.$el;

        _.each(fields, function(field) {
          if (field.type == 'checkbox') {
            extra[field.name] = el.find('#hull-form-' + field.name).is(':checked');
          } else {
            extra[field.name] = el.find('#hull-form-' + field.name).val();
          }
        });

        this.register(extra);
      }
    },

    _findFieldValue: function(name) {
      var me = this.data.me.toJSON();

      var identities = _.reduce(me.identities, function(memo, i) {
        return _.extend(memo, i);
      }, {});

      return me.profile[name] || me[name] || identities[name];
    },

    _ensureFormEl: function() {
      if (this.formEl == null) {
        this.formEl = document.getElementById(this.formId);
      }
    }
  };
});
