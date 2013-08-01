Hull.define({
  type: "Hull",
  templates: ["dox_list"],

  initialize: function () {
    this.options.source = 'http://hull-js.s3.amazonaws.com/' + Hull.version + '/docs/';
  },

  datasources: {
    components: function() {
      return $.getJSON(this.options.source+'index.json');
    }
  },
  beforeRender: function(data) {
    data.components = data.components[0].components;
    data.source = this.options.source;
    return data;
  }
});
