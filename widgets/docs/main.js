Hull.define({
  type: "Hull",

  templates: ['docs'],

  datasources: {
    all: 'docs/all',
    doc: function() {
      if (this.options.api) {
        return this.api('docs/' + this.options.api);
      }
    }
  },

  actions: {
    showDetails: function(e, params) {
      this.options.api = params.data.api;
      this.render();
    }
  }

});
