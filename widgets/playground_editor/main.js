define({
  type: 'Hull',

  templates: [
    'editor'
  ],

  initialize: function() {
    if (typeof CodeMirror === 'undefined') {
      throw 'Load CodeMirror before using this widget.';
    }

    this.sandbox.on('hull.playground.load', _.bind(function(code) {
      this.editor.setValue(code);
    }, this));
  },

  afterRender: function() {
    var code = this.options.code || '';

    this.editor = new CodeMirror(this.$('.hull-playground-editor')[0], {
      mode: 'htmlmixed',
      value: code,
      tabMode: 'indent',
      theme: 'solarized dark',
      lineNumbers: false
    });

    this.run(code);
  },

  actions: {
    run: function() {
      this.run(this.editor.getValue());
    }
  },

  run: function(code) {
    this.sandbox.emit('hull.playground.run',code);
  }
});
