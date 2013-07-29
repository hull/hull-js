Hull.define({
  type: "Hull",
  templates: ["dox_list"],

  initialize: function () {
    this.options.source = 'http://hull-js.s3.amazonaws.com/' + Hull.version + '/docs/';
  },

  datasources: {
    widgets: function() {
      return $.getJSON(this.options.source+'index.json');
    }
  },
  beforeRender: function(data) {
    data.widgets = data.widgets[0].widgets;
    data.source = this.options.source;
    return data;
  }
});
