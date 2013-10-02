/**
 * 
 * Opens a share dialog [Beta]
 *
 * @name Button
 * @param {String} provider Provider to use (facebook/twitter...)
 * @example <div data-hull-component="share/button@hull"></div>
 */
 Hull.component({
  type: 'Hull',

  templates: ['twitter'],

  beforeRender: function(data) {
    if (this.options.provider) { this.template = this.options.provider; }

    data.label = this.options.label;
    data.text = encodeURIComponent(this.options.text);
    data.url = encodeURIComponent(this.options.url);
  }
});
