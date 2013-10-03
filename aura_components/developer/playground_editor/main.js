/**
 * 
 * Lets you write html, emits an event with it's content when you click the button
 *
 * @name Playground Editor
 * @example <div data-hull-component="developer/playground_editor@hull"></div>
 */
Hull.component({
  type: 'Hull',

  templates: ['editor'],

  require:['codemirror-compressed'],

  initialize: function() {
    if (typeof CodeMirror === 'undefined') {
      throw 'Load CodeMirror before using this component.';
    }

    this.sandbox.on('hull.playground.load', this.sandbox.util._.bind(function(code) {
      this.editor.setValue(code);
    }, this));
  },

  afterRender: function() {
    var code = this.options.code || '';
    var theme = this.options.theme || 'default';
    this.editor = new CodeMirror(this.$('[data-hull-playground]')[0], {
      mode: 'htmlmixed',
      value: code,
      tabMode: 'indent',
      theme: theme,
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
