/**
 * Share widget
 */
define({
  type: 'Hull',

  templates: ['twitter'],

  beforeRender: function(data) {
    if (this.options.provider) { this.template = this.options.provider; }

    data.label = this.options.label;
    data.text = this.options.text;
  }
});
