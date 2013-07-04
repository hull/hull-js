/**
 * ## Share
 */
Hull.define({
  type: 'Hull',

  templates: ['twitter'],

  beforeRender: function(data) {
    if (this.options.provider) { this.template = this.options.provider; }

    data.label = this.options.label;
    data.text = encodeURIComponent(this.options.text);
    data.url = encodeURIComponent(this.options.url);
  }
});
