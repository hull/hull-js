/**
 *
 * Shows a form so the user can fill any kind of data.
 *
 * Define the fields using the `admin/registration` component.
 * Client-side validation is handled automatically and forms are build using a form builder with support for several field types.
 * Look at the JSON samples below to get a feel on what field types are supported.
 *
 * ## Supported field types
 *
 * ### Text
 * ```js
 * {
 *   type : 'text',
 *   name : 'unique_name',
 *   label : 'Name',
 *   pattern : 'Regex/HTML5 Standard',
 *   value : 'Default Value',
 *   autocomplete: false,
 *   required: true,
 *   error : 'Error message',
 *   placeholder : 'bob',
 * }
 * ```
 *
 * ### Email
 * ```js
 * {
 *   type : 'email',
 *   name : 'unique_name',
 *   label : 'Email',
 *   pattern : 'Regex/HTML5 Standard',
 *   value : '',
 *   required: true,
 *   error : 'Invalid Email',
 *   placeholder : 'you@awesome.com'
 * }
 * ```
 * ### Url
 * ```js
 * {
 *   type : 'url',
 *   name : 'unique_name',
 *   label : 'Name',
 *   pattern : 'Regex/HTML5 Standard',
 *   value : '',
 *   required: true,
 *   error : 'You made an error',
 *   placeholder : 'placeholder content'
 * }
 * ```
 *
 * ### Telephone
 * ```js
 * {
 *   type : 'tel',
 *   name : 'unique_name',
 *   label : 'Name',
 *   pattern : 'Regex/HTML5 Standard',
 *   value : '',
 *   required: true,
 *   error : 'You made an error',
 *   placeholder : 'placeholder content'
 * }
 * ```
 *
 * ### Select
 * ```js
 * {
 *   type : 'select',
 *   name : 'unique_name',
 *   label : 'Name',
 *   value : '',
 *   required: true,
 *   options:[
 *     {label:"Label", value: "value"},
 *     {label:"Label", value: "value"},
 *     {label:"Label", value: "value"}
 *   ],
 *   error : 'You made an error',
 *   placeholder : 'placeholder content'
 * }
 * ```
 *
 * ### Checkbox
 * ```js
 * {
 *   type : 'checkbox',
 *   name : 'unique_name',
 *   label : 'Name',
 *   value : '',
 *   required: true,
 *   error : 'You made an error'
 * },
 * ```
 *
 * @name Form
 * @param {Boolean} editable Wether to offer the user to modify his form again once he submitted it.
 * @action {achieve}
 * @datasource {activities}
 * @template {template_name}
 * @your_custom_tag {name} value
 * @your_custom_tag value
 * @example <div data-hull-component='registration/form@hull'></div>
 */
Hull.component({
  type: 'Hull',

  templates: ['form', 'complete'],

  refreshEvents: ['model.hull.me.change'],

  require:['h5f'],

  complete: false,

  options:{
    editable:false
  },

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
    this.formId = "form_"+(new Date()).getTime();
    var _ = this.sandbox.util._;
    _.bindAll.apply(undefined, [this].concat(_.functions(this)));
  },

  validate: function() {
    this._ensureFormEl();
    var isValid = this.formEl.checkValidity();
    if(isValid) return isValid;
    this.$el.find('[data-hull-input]').each(function(key, el){
      var $el = $(el),
          id = $el.attr('id');
      var errorMsg = $el.siblings('[data-hull-error]')
      errorMsg.text((el.checkValidity()) ? '' : $el.data('errorMessage'));
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
    var fields = this.sandbox.util._.map(data.fields, function(f) {
      f.value = this._findFieldValue(f.name);
      return f;
    }, this);

    var profile = data.me.profile || {};

    // Check if user.profile contains all the fields with their respective
    // value. If it's the case we consider the form as complete.
    var isComplete = this.sandbox.util._.every(fields, function(f) {
      var profileField = profile[f.name];
      if (f.type === 'checkbox') {
        return profileField == f.value;
      } else {
        return !!profileField && profileField === f.value;
      }
    });

    this.template = isComplete ? 'complete' : 'form';

    this.fields = fields;
  },

  afterRender: function() {
    if (this.template === 'form') {
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
      this.render("form");
      return false;
    },

    submit: function(e, opts) {
      e && e.preventDefault();

      if (!this.validate()) {
        e && e.stopPropagation();
        e && e.stopImmediatePropagation();
        return false;
      }

      var fields = this.sandbox.util._.clone(this.fields),
          extra  = {},
          el = this.$el;

      this.sandbox.util._.each(fields, function(field) {
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
    var me = this.data.me.toJSON() || {};

    var identities = this.sandbox.util._.reduce(me.identities, this.sandbox.util._.bind(function(memo, i) {
      return this.sandbox.util._.extend(memo, i);
    }, this), {});

    me.profile = me.profile || {};
    identities = identities || {};

    return me.profile[name] || me[name] || identities[name];
  },

  _ensureFormEl: function() {
    this.formEl = this.formEl || document.getElementById(this.formId);
  }
});
