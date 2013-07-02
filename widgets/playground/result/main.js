Hull.define({
  type: 'Hull',

  templates: [
    'result'
  ],

  initialize: function() {
    this.code = this.options.code || '';

    this.sandbox.on('hull.playground.run', _.bind(this.updateCode, this));
    this.sandbox.on('hull.playground.load', _.bind(this.updateCode, this));
  },

  beforeRender: function(data) {
    data.code = this.code;
  },

  updateCode: function(code) {
    this.code = code;
    this.render();
  }
});
