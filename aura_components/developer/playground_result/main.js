/**
 * 
 * Renders content into itself, gets it from events.
 *
 * @name Playground Result
 * @example <div data-hull-component="developer/playground_result@hull"></div>
 */
Hull.define({
  type: 'Hull',

  templates: [
    'result'
  ],

  initialize: function() {
    this.code = this.options.code || '';

    this.sandbox.on('hull.playground.run', this.sandbox.util._.bind(this.updateCode, this));
    this.sandbox.on('hull.playground.load', this.sandbox.util._.bind(this.updateCode, this));
  },

  beforeRender: function(data) {
    data.code = this.code;
  },

  updateCode: function(code) {
    this.code = code;
    this.render();
  }
});
