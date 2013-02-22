define({
  type: "Hull",
  templates: ["dox_list"],
  options: {
    source:'http://hull-js.s3.amazonaws.com/0.2.0/docs'
  },

  datasources: {
    widgets: function() {
      return $.getJSON(this.options.source+'/index.json');
    }
  },
  beforeRender: function(data) {
    data.widgets = data.widgets[0].widgets;
    data.source = this.options.source;
    return data;
  },
});
