define(['hbs!./identity'], function(tpl) {
  _templates = { identity: tpl }
  return {
    type: "Hull",
    templates: ['identity'],
    _templates: _templates,
    initialize: function() {
      this.render();
    },
    beforeRender: function(data) {
      console.warn("Rendering identity...", data)
      return data;
    }
  }
});
